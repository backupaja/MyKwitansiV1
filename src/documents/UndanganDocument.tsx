import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import type { DataUndanganView } from "../types";
import { formatDateFullIndo, formatDateNoDay } from "../utils/formatters";
import { telkomLogo } from "../assets/telkomLogoBase64";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: "Courier",
    fontSize: 10,
    lineHeight: 1.2,
  },
  table: {
    width: "100%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#000",
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 80,
  },
  cellLogo: {
    width: "60%",
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  logoImage: {
    width: 190,
    height: 63,
  },
  cellTitle: {
    width: "40%",
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    letterSpacing: 4,
    textDecoration: "underline",
  },
  col1: { width: "35%", borderRightWidth: 1, borderColor: "#000", padding: 5 },
  col2: { width: "25%", borderRightWidth: 1, borderColor: "#000", padding: 5 },
  col3: { width: "40%", borderRightWidth: 1, borderColor: "#000", padding: 5 },
  col1_2: { width: "60%", borderRightWidth: 1, borderColor: "#000", padding: 5 },
  colAll: { width: "100%", borderRightWidth: 1, borderColor: "#000", padding: 5 },
  
  labelText: {
    fontFamily: "Courier-Bold",
  },
  valueText: {
    fontFamily: "Courier",
  },
  signatureContainer: {
    marginTop: 0,
    alignItems: "center",
  },
  signatureDate: {
    marginBottom: 35,
  },
  signatureName: {
    fontFamily: "Courier-Bold",
    textDecoration: "underline",
    flexShrink: 1,
  },
  signatureTitle: {
    fontFamily: "Courier-Bold",
  }
});

interface Props {
  data: DataUndanganView;
}

export function UndanganDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.table}>
          
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.cellLogo}>
              {/* Telkom University Logo embedded */}
              <Image src={telkomLogo} style={styles.logoImage} />
            </View>
            <View style={styles.cellTitle}>
              <Text style={styles.titleText}>U N D A N G A N</Text>
            </View>
          </View>

          {/* Row 1: Acara & Penyelenggara (Inline) */}
          <View style={styles.row}>
            <View style={styles.col1_2}>
              <Text><Text style={styles.labelText}>Acara:  </Text>{data.acara}</Text>
            </View>
            <View style={styles.col3}>
              <Text><Text style={styles.labelText}>Penyelenggara:</Text></Text>
              <Text>{data.penyelenggara}</Text>
            </View>
          </View>

          {/* Row 2: Hari/Tanggal, Waktu, Tempat (Block) */}
          <View style={styles.row}>
            <View style={styles.col1}>
              <Text style={styles.labelText}>Hari/Tanggal:</Text>
              <Text style={styles.valueText}>
                {data.tanggal_acara.includes("-") ? formatDateFullIndo(data.tanggal_acara) : data.tanggal_acara}
              </Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.labelText}>Waktu:</Text>
              <Text style={styles.valueText}>{data.waktu_mulai.substring(0, 5)} - {data.waktu_selesai.substring(0, 5)}</Text>
              <Text style={styles.valueText}>WIB</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.labelText}>Tempat:</Text>
              <Text style={styles.valueText}>{data.tempat_acara}</Text>
            </View>
          </View>

          {/* Row 3: Agenda (Inline) */}
          <View style={styles.row}>
            <View style={styles.colAll}>
              <Text><Text style={styles.labelText}>Agenda:  </Text>{data.agenda}</Text>
            </View>
          </View>

          {/* Row 4: Peserta (Inline) */}
          <View style={styles.row}>
            <View style={styles.colAll}>
              <Text><Text style={styles.labelText}>Peserta:  </Text>{data.peserta}</Text>
            </View>
          </View>

          {/* Row 5: Dokumen Pendukung (Inline) */}
          <View style={styles.row}>
            <View style={styles.colAll}>
              <Text><Text style={styles.labelText}>Dokumen Pendukung:  </Text>{data.dokumen_pendukung}</Text>
            </View>
          </View>

          {/* Row 6: Hasil Pertemuan (Inline) */}
          <View style={styles.row}>
            <View style={styles.colAll}>
              <Text><Text style={styles.labelText}>Hasil Pertemuan:  </Text>{data.hasil_pertemuan}</Text>
            </View>
          </View>

          {/* Row 7: Tembusan & Tanda Tangan */}
          <View style={[styles.row, { minHeight: 120 }]}>
            <View style={styles.col1_2}>
              <Text><Text style={styles.labelText}>Tembusan:  </Text>{data.tembusan}</Text>
            </View>
            <View style={[styles.col3, { justifyContent: 'space-between', paddingTop: 8, paddingBottom: 10, flex: 1 }]}>
              {/* Tanggal di atas */}
              <Text style={[styles.signatureDate, { marginBottom: 0, textAlign: 'center' }]}>
                {data.tempat_surat}, {data.tanggal_surat && data.tanggal_surat.includes("-") ? formatDateNoDay(data.tanggal_surat) : data.tanggal_surat}
              </Text>
              {/* Nama & jabatan di bawah */}
              <View style={styles.signatureContainer}>
                <Text style={[styles.signatureName, { fontSize: data.nama_ttd && data.nama_ttd.length > 25 ? 7.5 : 10 }]}>{data.nama_ttd}</Text>
                <Text style={styles.signatureTitle}>{data.jabatan_ttd}</Text>
              </View>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
}

/** Multi-page document — each undangan gets its own A4 page */
export function MultiUndanganDocument({ items }: { items: DataUndanganView[] }) {
  return (
    <Document>
      {items.map((data) => (
        <Page key={data.id_formulir_undangan} size="A4" style={styles.page}>
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <View style={styles.cellLogo}>
                <Image src={telkomLogo} style={styles.logoImage} />
              </View>
              <View style={styles.cellTitle}>
                <Text style={styles.titleText}>U N D A N G A N</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col1_2}>
                <Text><Text style={styles.labelText}>Acara:  </Text>{data.acara}</Text>
              </View>
              <View style={styles.col3}>
                <Text><Text style={styles.labelText}>Penyelenggara:</Text></Text>
                <Text>{data.penyelenggara}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col1}>
                <Text style={styles.labelText}>Hari/Tanggal:</Text>
                <Text style={styles.valueText}>
                  {data.tanggal_acara && data.tanggal_acara.includes("-") ? formatDateFullIndo(data.tanggal_acara) : data.tanggal_acara}
                </Text>
              </View>
              <View style={styles.col2}>
                <Text style={styles.labelText}>Waktu:</Text>
                <Text style={styles.valueText}>{data.waktu_mulai?.substring(0, 5)} - {data.waktu_selesai?.substring(0, 5)}</Text>
                <Text style={styles.valueText}>WIB</Text>
              </View>
              <View style={styles.col3}>
                <Text style={styles.labelText}>Tempat:</Text>
                <Text style={styles.valueText}>{data.tempat_acara}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.colAll}>
                <Text><Text style={styles.labelText}>Agenda:  </Text>{data.agenda}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.colAll}>
                <Text><Text style={styles.labelText}>Peserta:  </Text>{data.peserta}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.colAll}>
                <Text><Text style={styles.labelText}>Dokumen Pendukung:  </Text>{data.dokumen_pendukung}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.colAll}>
                <Text><Text style={styles.labelText}>Hasil Pertemuan:  </Text>{data.hasil_pertemuan}</Text>
              </View>
            </View>
            <View style={[styles.row, { minHeight: 120 }]}>
              <View style={styles.col1_2}>
                <Text><Text style={styles.labelText}>Tembusan:  </Text>{data.tembusan}</Text>
              </View>
              <View style={[styles.col3, { justifyContent: 'space-between', paddingTop: 8, paddingBottom: 10, flex: 1 }]}>
                <Text style={[styles.signatureDate, { marginBottom: 0, textAlign: 'center' }]}>
                  {data.tempat_surat}, {data.tanggal_surat && data.tanggal_surat.includes("-") ? formatDateNoDay(data.tanggal_surat) : data.tanggal_surat}
                </Text>
                <View style={styles.signatureContainer}>
                  <Text style={[styles.signatureName, { fontSize: data.nama_ttd && data.nama_ttd.length > 25 ? 7.5 : 10 }]}>{data.nama_ttd}</Text>
                  <Text style={styles.signatureTitle}>{data.jabatan_ttd}</Text>
                </View>
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}
