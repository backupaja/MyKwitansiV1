import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DataTransaksiView } from "../types";
import { formatRp, terbilang, CURRENT_YEAR, formatDocumentNumber } from "../utils/formatters";

// Default standard font in react-pdf is Helvetica
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  receiptContainer: {
    height: 260,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "dashed",
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#000000",
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
  },
  label: {
    width: 120,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    paddingBottom: 2,
  },
  valueBox: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 2,
  },
  value: {
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    fontSize: 11,
    paddingLeft: 4,
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amountWrapper: {
    width: 180,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  amountCurrency: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#000000",
    marginLeft: 4,
    width: 30,
  },
  amountValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  signatureBox: {
    alignItems: "center",
    width: 160,
  },
  signatureDate: {
    fontSize: 10,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 4,
  },
  signatureSpace: {
    height: 40,
  },
  signatureName: {
    fontSize: 10,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  }
});

interface Props {
  data: DataTransaksiView;
}

/** Single kwitansi block — takes up ~1/3 of an A4 page */
function KwitansiBlock({ data }: Props) {
  return (
    <View style={styles.receiptContainer} wrap={false}>
      <Text style={styles.title}>KWITANSI PEMBAYARAN</Text>

      <View style={styles.row}>
        <Text style={styles.label}>No Kwitansi</Text>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{formatDocumentNumber(data.id_data_transaksi)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Diterima Dari</Text>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{data.terima_dari}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Terbilang</Text>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{terbilang(data.jumlah_uang)} Rupiah</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Untuk Pembayaran</Text>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{data.untuk_pembayaran}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.amountWrapper}>
          <Text style={styles.amountCurrency}>Rp</Text>
          <Text style={styles.amountValue}>{formatRp(data.jumlah_uang).replace("Rp ", "")}</Text>
        </View>
        
        <View style={styles.signatureBox}>
          <Text style={styles.signatureDate}>
            {data.kota} , {data.tanggal_transaksi}
          </Text>
          <View style={styles.signatureSpace} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>
            ({data.penerima_uang})
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Single-transaction kwitansi PDF. */
export function KwitansiDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <KwitansiBlock data={data} />
      </Page>
    </Document>
  );
}

/** Multi-transaction kwitansi PDF — 3 pages per sheet. */
export function MultiKwitansiDocument({ items }: { items: DataTransaksiView[] }) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {items.map((data) => (
          <KwitansiBlock key={data.id_data_transaksi} data={data} />
        ))}
      </Page>
    </Document>
  );
}
