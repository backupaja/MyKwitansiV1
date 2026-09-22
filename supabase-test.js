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
  console.log("=== STARTING SUPABASE CRUD VERIFICATION ===");
  const { data: admins } = await supabase.from("admin").select("*");
  const adminId = admins[0]?.id_admin;

  console.log("\n-- Testing Nota CRUD (Sequential) --");
  
  // 1. Insert header
  const { data: header, error: headerErr } = await supabase
    .from("formulir_nota")
    .insert({
      tanggal_transaksi: "2025-01-01",
      total_harga: 500,
      id_admin: adminId,
    })
    .select(`*`)
    .single();

  if (headerErr) {
    console.error("Failed to create header:", headerErr);
    process.exit(1);
  }
  
  console.log("✅ Created header:", header.id_formulir_nota);

  // 2. Insert items
  const { error: itemsErr } = await supabase
    .from("item_nota")
    .insert([{
      id_formulir_nota: header.id_formulir_nota,
      nama_barang: "Test Item",
      satuan: "pcs",
      harga: 100,
      jumlah_item: 5,
      sub_total_harga: 500
    }]);

  if (itemsErr) {
    console.error("Failed to create items:", itemsErr);
  } else {
    console.log("✅ Created items");
  }

  // 3. Delete
  const { error: delErr } = await supabase
    .from("formulir_nota")
    .delete()
    .eq("id_formulir_nota", header.id_formulir_nota);

  if (delErr) console.error("Failed to delete:", delErr);
  else console.log("✅ Deleted Nota (Cascade successful)");
}

runTest().catch(console.error);
