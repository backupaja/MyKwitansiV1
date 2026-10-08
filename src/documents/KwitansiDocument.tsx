import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DataTransaksiView } from "../types";
import { formatRp, terbilang, CURRENT_YEAR, formatDocumentNumber, formatDateNoDay } from "../utils/formatters";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  receiptContainer: {
    height: 335,
    paddingHorizontal: 28,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "dashed",
    marginBottom: 5,
  },
  titleWrapper: {
    alignItems: "center",
    marginBottom: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: "#111111",
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  label: {
    width: 120,
    color: "#6b7280",
    fontFamily: "Helvetica",
    fontSize: 9.5,
    paddingBottom: 3,
  },
  valueBox: {
    flex: 1,
    borderBottomWidth: 0.75,
    borderBottomColor: "#9ca3af",
    paddingBottom: 3,
    paddingLeft: 6,
  },
  value: {
    fontFamily: "Helvetica",
    color: "#111111",
    fontSize: 10.5,
  },
  valueBold: {
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    fontSize: 10.5,
  },
  noKwitansi: {
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountWrapper: {
    width: 180,
    borderTopWidth: 1,
    borderTopColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  amountCurrency: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#374151",
    marginLeft: 4,
    width: 26,
  },
  amountValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  signatureBox: {
    alignItems: "center",
    width: 170,
  },
  signatureDate: {
    fontSize: 9.5,
    color: "#374151",
    fontFamily: "Helvetica",
    marginBottom: 4,
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 0.75,
    borderBottomColor: "#374151",
    marginBottom: 4,
  },
  signatureLineTop: {
    width: "100%",
    borderBottomWidth: 0.75,
    borderBottomColor: "#374151",
  },
  signatureSpace: {
    height: 65,
  },
  signatureName: {
    fontSize: 10,
    color: "#111111",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  materaiBox: {
    width: 70,
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  materaiText: {
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
  },
  materaiWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    marginBottom: 20,
  },
});

const MATERAI_THRESHOLD = 5_000_000;

interface Props {
  data: DataTransaksiView;
}

function KwitansiBlock({ data }: Props) {
  return (
    <View style={styles.receiptContainer} wrap={false}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>KWITANSI PEMBAYARAN</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>No Kwitansi</Text>
        <View style={styles.valueBox}>
          <Text style={styles.noKwitansi}>{formatDocumentNumber(data.id_data_transaksi)}</Text>
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
          <Text style={styles.valueBold}>{terbilang(data.jumlah_uang)} Rupiah</Text>
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
          <Text style={styles.signatureDate}>{data.kota}, {formatDateNoDay(data.tanggal_transaksi)}</Text>
          <View style={styles.signatureLineTop} />
          {data.jumlah_uang >= MATERAI_THRESHOLD ? (
            <View style={styles.materaiWrapper}>
              <View style={styles.materaiBox}>
                <Text style={styles.materaiText}>Materai{"\n"}Rp 10.000</Text>
              </View>
            </View>
          ) : (
            <View style={styles.signatureSpace} />
          )}
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{data.penerima_uang}</Text>
        </View>
      </View>
    </View>
  );
}

export function KwitansiDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <KwitansiBlock data={data} />
      </Page>
    </Document>
  );
}

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