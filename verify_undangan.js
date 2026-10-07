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

async function verifyMigration() {
  console.log("=== VERIFYING UNDANGAN MIGRATION ===");
  
  // 1. Verifikasi tabel formulir_undangan (dengan mencoba select)
  const { data, error } = await supabase.from("formulir_undangan").select("id_formulir_undangan").limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log("❌ ERROR: Tabel 'formulir_undangan' belum ada di Supabase!");
      process.exit(1);
    }
    console.log("❌ ERROR:", error.message);
    process.exit(1);
  }
  
  console.log("✅ Tabel 'formulir_undangan' tersedia.");
  
  // 2. Verifikasi view vw_undangan
  const { data: viewData, error: viewError } = await supabase.from("vw_undangan").select("*").limit(1);
  if (viewError) {
    console.log("❌ ERROR: View 'vw_undangan' gagal diakses atau belum ada!");
    process.exit(1);
  }
  console.log("✅ View 'vw_undangan' tersedia.");
  
  console.log("✅ Verifikasi dasar selesai. Migration sepertinya telah dieksekusi.");
}

verifyMigration();
