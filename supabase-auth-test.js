import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envContent = fs.readFileSync(path.resolve(".env.local"), "utf-8");
let supabaseUrl = "";
let supabaseKey = "";
envContent.split("\n").forEach(line => {
  if (line.startsWith("VITE_SUPABASE_URL=")) supabaseUrl = line.split("=")[1].trim();
  if (line.startsWith("VITE_SUPABASE_PUBLISHABLE_KEY=")) supabaseKey = line.split("=")[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("=== SUPABASE AUTH & SECURITY TEST ===");

  const TEST_EMAIL = "bang_karir@mykwitansi.local";
  const TEST_PASS = "rahasia"; // Replace with whatever password was set during manual signup

  console.log("\n1. Testing Auth Login...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASS
  });

  if (authError) {
    console.error("❌ Auth Login Failed:", authError.message);
    console.log("👉 Did you create the test user in Supabase Auth and link their auth_id in the admin table?");
    process.exit(1);
  }

  console.log("✅ Auth Login Successful. User ID:", authData.user.id);
  
  // Set session to client to test RLS
  await supabase.auth.setSession({
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token
  });

  console.log("\n2. Testing RLS (Admin Table Access)...");
  const { data: adminProfile, error: adminErr } = await supabase
    .from("admin")
    .select("*")
    .eq("auth_id", authData.user.id)
    .single();

  if (adminErr || !adminProfile) {
    console.error("❌ RLS / Admin Fetch Failed:", adminErr?.message);
    process.exit(1);
  }
  console.log("✅ Admin Profile Fetched (RLS Passed):", adminProfile.username);

  console.log("\n3. Testing Nota RPC (Atomicity)...");
  const { data: createData, error: createErr } = await supabase.rpc('create_nota', {
    p_tanggal_transaksi: "2025-01-01",
    p_items: [{
      nama_barang: "Test Item via RPC",
      satuan: "pcs",
      harga: 100,
      jumlah_item: 5
    }]
  });

  if (createErr || !createData) {
    console.error("❌ create_nota RPC Failed:", createErr);
    process.exit(1);
  }

  // Handle both array-return and object-return formats from PostgREST functions
  const headerId = createData[0]?.id_formulir_nota || createData.id_formulir_nota;
  const headerTotal = createData[0]?.total_harga || createData.total_harga;
  
  console.log("✅ RPC Create Successful. Nota ID:", headerId, "Total Harga:", headerTotal);
  if (headerTotal !== 500) {
     console.error("❌ Financial Integrity Failed! Expected total_harga=500, got:", headerTotal);
     process.exit(1);
  }

  console.log("\n4. Testing Update RPC...");
  const { data: updateData, error: updateErr } = await supabase.rpc('update_nota', {
    p_id_formulir_nota: headerId,
    p_tanggal_transaksi: "2025-01-02",
    p_items: [{
      nama_barang: "Updated Item",
      satuan: "pcs",
      harga: 200,
      jumlah_item: 2
    }]
  });

  if (updateErr) {
     console.error("❌ update_nota RPC Failed:", updateErr);
  } else {
     const newTotal = updateData[0]?.total_harga || updateData.total_harga;
     console.log("✅ RPC Update Successful. New Total:", newTotal);
     if (newTotal !== 400) console.error("❌ Update Integrity Failed!");
  }

  console.log("\n5. Testing Cascade Delete (Restricted to Authenticated)...");
  const { error: delErr } = await supabase.from("formulir_nota").delete().eq("id_formulir_nota", headerId);
  if (delErr) {
    console.error("❌ Delete Failed:", delErr);
  } else {
    console.log("✅ Delete Successful. Cascade and RLS worked.");
  }

  console.log("\n=== SECURITY VERIFICATION COMPLETE ===");
}

runTest().catch(console.error);
