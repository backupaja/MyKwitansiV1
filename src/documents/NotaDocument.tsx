import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DataNotaView } from "../types";
import { formatRp, formatDocumentNumber, formatAdminName } from "../utils/formatters";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  notaContainer: {
    padding: 20,
    minHeight: "31.5%", // Exactly 3 notas per A4 page
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "dashed",
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 10,
  },
  titleGroup: {
    flexDirection: "column",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  noNota: {
    fontSize: 11,
    color: "#4b5563",
  },
  noNotaValue: {
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  dateGroup: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  dateLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#111827",
  },
  table: {
    width: "100%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#111827",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
  },
  tableCell: {
    fontSize: 10,
    color: "#374151",
  },
  colQty:     { width: "12%", textAlign: "center" },
  colUnit:    { width: "13%", textAlign: "center" },
  colName:    { width: "35%", paddingLeft: 4 },
  colPrice:   { width: "20%", textAlign: "right" },
  colSubtotal:{ width: "20%", textAlign: "right" },
  
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#111827",
    paddingTop: 10,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginRight: 16,
    color: "#111827",
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#111827",
  }
});

interface Props {
  data: DataNotaView;
}

function NotaBlock({ data }: Props) {
  return (
    <View style={styles.notaContainer}>
      {/* Header */}
      <View style={styles.headerRow} wrap={false}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>DATA NOTA</Text>
          <Text style={styles.noNota}>
            <Text style={styles.noNotaValue}>{formatDocumentNumber(data.id_data_nota)}</Text>
          </Text>
        </View>
        <View style={styles.dateGroup}>
          <Text style={styles.dateLabel}>Tanggal Transaksi</Text>
          <Text style={styles.dateValue}>{data.tanggal_transaksi}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeaderRow} wrap={false}>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Jumlah</Text>
          <Text style={[styles.tableHeaderCell, styles.colUnit]}>Satuan</Text>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Nama Barang</Text>
          <Text style={[styles.tableHeaderCell, styles.colPrice]}>Harga</Text>
          <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Sub Total</Text>
        </View>

        {data.items.map((item) => (
          <View key={item.id_item_nota} style={styles.tableRow} wrap={false}>
            <Text style={[styles.tableCell, styles.colQty]}>{item.jumlah_item}</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>{item.satuan}</Text>
            <Text style={[styles.tableCell, styles.colName]}>{item.nama_barang}</Text>
            <Text style={[styles.tableCell, styles.colPrice]}>{formatRp(item.harga)}</Text>
            <Text style={[styles.tableCell, styles.colSubtotal]}>{formatRp(item.sub_total_harga)}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer} wrap={false}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatRp(data.total_harga)}</Text>
      </View>
    </View>
  );
}

export function NotaDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <NotaBlock data={data} />
      </Page>
    </Document>
  );
}

export function MultiNotaDocument({ items }: { items: DataNotaView[] }) {
  // Chunk items into arrays of max 3 items
  const chunks = [];
  for (let i = 0; i < items.length; i += 3) {
    chunks.push(items.slice(i, i + 3));
  }

  return (
    <Document>
      {chunks.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation="portrait" style={styles.page}>
          {chunk.map((data) => (
            <NotaBlock key={data.id_data_nota} data={data} />
          ))}
        </Page>
      ))}
    </Document>
  );
}
