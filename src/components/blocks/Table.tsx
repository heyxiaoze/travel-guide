import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { RichText } from "@/components/RichText";
import type { TableBlock } from "@/types/guide";

export function TableView({ block }: { block: TableBlock }) {
  return (
    <div className="rounded-lg border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            {block.head.map((h, i) => (
              <TableHead key={i}>
                <RichText value={h} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {block.rows.map((r, ri) => (
            <TableRow key={ri}>
              {r.map((c, ci) => (
                <TableCell key={ci}>
                  <RichText value={c} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
