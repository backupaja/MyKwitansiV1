import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";
import type { DataUndanganView } from "../types";

// Register fonts if not already registered in pdfService, or assume they are.
// Usually pdfService registers them, but if we need bold we must ensure it's available.
// We will use standard Helvetica for simplicity, or the ones already registered.

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    fontFamily: "Helvetica",
  },
  headerTable: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 0,
  },
  logoTextContainer: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText1: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#b91c1c", // red
  },
  logoText2: {
    fontSize: 14,
    fontFamily: "Helvetica",
  },
  headerRight: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4,
  },
  row: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  colHalf: {
    flex: 1,
    padding: 6,
  },
  colFull: {
    flex: 1,
    padding: 6,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  labelText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  valueText: {
    fontSize: 10,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 120, // To give space for signatures
  },
  footerColLeft: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  footerColRight: {
    flex: 1,
    padding: 4,
    alignItems: "center", // center the signature
  },
  signatureDate: {
    fontSize: 10,
    marginBottom: 40, // Space for signature
  },
  signatureName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
  signatureTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  }
});

interface Props {
  data: DataUndanganView;
}

export function UndanganDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Table */}
        <View style={styles.headerTable}>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText1}>Telkom</Text>
            <Text style={styles.logoText2}>University</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.titleText}>U N D A N G A N</Text>
          </View>
        </View>

        {/* Row 1: Acara & Penyelenggara */}
        <View style={styles.row}>
          <View style={[styles.colHalf, styles.borderRight]}>
            <Text style={styles.labelText}>Acara:</Text>
            <Text style={styles.valueText}>{data.acara}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.labelText}>Penyelenggara:</Text>
            <Text style={styles.valueText}>{data.penyelenggara}</Text>
          </View>
        </View>

        {/* Row 2: Hari/Tanggal, Waktu, Tempat */}
        <View style={styles.row}>
          <View style={[styles.colHalf, styles.borderRight, { flex: 0.8 }]}>
            <Text style={styles.labelText}>Hari/Tanggal:</Text>
            <Text style={styles.valueText}>{data.tanggal_acara}</Text>
          </View>
          <View style={[styles.colHalf, styles.borderRight, { flex: 0.6 }]}>
            <Text style={styles.labelText}>Waktu:</Text>
            <Text style={styles.valueText}>{data.waktu}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.labelText}>Tempat:</Text>
            <Text style={styles.valueText}>{data.tempat}</Text>
          </View>
        </View>

        {/* Row 3: Agenda */}
        <View style={styles.row}>
          <View style={styles.colFull}>
            <Text style={styles.labelText}>Agenda:</Text>
            <Text style={styles.valueText}>{data.agenda}</Text>
          </View>
        </View>

        {/* Row 4: Peserta */}
        <View style={styles.row}>
          <View style={styles.colFull}>
            <Text style={styles.labelText}>Peserta:</Text>
            <Text style={styles.valueText}>{data.peserta}</Text>
          </View>
        </View>

        {/* Row 5: Dokumen Pendukung */}
        <View style={styles.row}>
          <View style={styles.colFull}>
            <Text style={styles.labelText}>Dokumen Pendukung:</Text>
            <Text style={styles.valueText}>{data.dokumen_pendukung}</Text>
          </View>
        </View>

        {/* Row 6: Hasil Pertemuan */}
        <View style={styles.row}>
          <View style={styles.colFull}>
            <Text style={styles.labelText}>Hasil Pertemuan:</Text>
            <Text style={styles.valueText}>{data.hasil_pertemuan}</Text>
          </View>
        </View>

        {/* Row 7: Tembusan & Signature */}
        <View style={styles.footerRow}>
          <View style={styles.footerColLeft}>
            <Text style={styles.labelText}>Tembusan:</Text>
            <Text style={styles.valueText}>{data.tembusan}</Text>
          </View>
          <View style={styles.footerColRight}>
            <Text style={styles.signatureDate}>{data.tempat_tanggal_surat}</Text>
            <Text style={styles.signatureName}>{data.nama_ttd}</Text>
            <Text style={styles.signatureTitle}>{data.jabatan_ttd}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
