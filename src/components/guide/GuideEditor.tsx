import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { toast } from "sonner";
import type {
  Guide,
  Section,
  Block,
  Place,
  DayItem,
  FoodItem,
  BudgetCell,
  GalleryItem,
} from "@/types/guide";

/* ------------------------------------------------------------------ */
/*  Small reusable field helpers                                      */
/* ------------------------------------------------------------------ */

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border bg-background px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls + " resize-y"}
    />
  );
}

function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={inputCls}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function MoveButtons({
  up,
  down,
  onUp,
  onDown,
}: {
  up: boolean;
  down: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={!up}
        onClick={onUp}
        title="上移"
      >
        ↑
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={!down}
        onClick={onDown}
        title="下移"
      >
        ↓
      </Button>
    </div>
  );
}

function RemoveButton({ onClick, title = "删除" }: { onClick: () => void; title?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-destructive"
      onClick={onClick}
      title={title}
    >
      ✕
    </Button>
  );
}

/* Generic repeatable list of OBJECT items (string[] uses StringList below). */
function ItemList<T>({
  items,
  onChange,
  create,
  addLabel = "添加",
  renderItem,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  create: () => T;
  addLabel?: string;
  renderItem: (args: {
    item: T;
    index: number;
    set: (patch: Partial<T>) => void;
    remove: () => void;
    move: (dir: -1 | 1) => void;
  }) => ReactNode;
}) {
  const setItem = (index: number, patch: Partial<T>) =>
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));
  const moveItem = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border bg-muted/30 p-2.5">
          {renderItem({
            item,
            index: i,
            set: (patch) => setItem(i, patch),
            remove: () => removeItem(i),
            move: (d) => moveItem(i, d),
          })}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, create()])}>
        + {addLabel}
      </Button>
    </div>
  );
}

/* Repeatable list of plain strings (used by text[] and checklist items). */
function StringList({
  items,
  onChange,
  addLabel = "添加一项",
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  addLabel?: string;
  placeholder?: string;
}) {
  const setAt = (i: number, v: string) => onChange(items.map((s, j) => (j === i ? v : s)));
  const removeAt = (i: number) => onChange(items.filter((_, j) => j !== i));
  const moveAt = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div className="flex flex-col gap-2">
      {items.map((s, i) => (
        <div key={i} className="flex items-start gap-2">
          <TextArea value={s} onChange={(v) => setAt(i, v)} placeholder={placeholder} rows={2} />
          <MoveButtons
            up={i > 0}
            down={i < items.length - 1}
            onUp={() => moveAt(i, -1)}
            onDown={() => moveAt(i, 1)}
          />
          <RemoveButton onClick={() => removeAt(i)} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        + {addLabel}
      </Button>
    </div>
  );
}

function PlaceFields({
  value,
  onChange,
}: {
  value?: Place;
  onChange: (p: Place) => void;
}) {
  const v: Place = value ?? { name: "" };
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-background/50 p-2">
      <TextInput value={v.name} onChange={(n) => onChange({ ...v, name: n })} placeholder="名称" />
      <TextInput
        value={v.sub ?? ""}
        onChange={(s) => onChange({ ...v, sub: s || undefined })}
        placeholder="副标题 / 地址"
      />
      <TextArea
        value={v.copy ?? ""}
        onChange={(c) => onChange({ ...v, copy: c || undefined })}
        rows={2}
        placeholder="描述"
      />
    </div>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  [n[i], n[j]] = [n[j], n[i]];
  return n;
}

/* ------------------------------------------------------------------ */
/*  Block type metadata + factory                                     */
/* ------------------------------------------------------------------ */

const blockTypeLabels: Record<Block["t"], string> = {
  text: "文本",
  callout: "提示框",
  place: "地点",
  places: "地点组",
  points: "要点",
  checklist: "清单",
  table: "表格",
  day: "日程",
  food: "美食",
  budget: "预算",
  summary: "总结",
  gallery: "图集",
};

const blockTypeOptions = (Object.keys(blockTypeLabels) as Block["t"][]).map((t) => ({
  value: t,
  label: blockTypeLabels[t],
}));

function createDefaultBlock(t: Block["t"]): Block {
  switch (t) {
    case "text":
      return { t: "text", s: "" };
    case "callout":
      return { t: "callout", tone: "info", title: "", s: "" };
    case "place":
      return { t: "place", name: "", copy: "", sub: "" };
    case "places":
      return { t: "places", items: [{ name: "" }] };
    case "points":
      return { t: "points", items: [{ k: "", v: "" }] };
    case "checklist":
      return { t: "checklist", groups: [{ title: "", items: [""] }] };
    case "table":
      return { t: "table", head: ["", ""], rows: [["", ""]] };
    case "day":
      return { t: "day", no: "D1", title: "", items: [], eat: [], note: "" };
    case "food":
      return { t: "food", city: "", items: [{ name: "" }] };
    case "budget":
      return { t: "budget", cells: [{ k: "", v: "" }] };
    case "summary":
      return { t: "summary", rows: [{ k: "", v: "" }] };
    case "gallery":
      return { t: "gallery", caption: "", items: [{ title: "" }] };
  }
}

/* ------------------------------------------------------------------ */
/*  Per-type block field editors                                      */
/* ------------------------------------------------------------------ */

function TextBlockFields({ block, onChange }: { block: Extract<Block, { t: "text" }>; onChange: (b: Block) => void }) {
  if (Array.isArray(block.s)) {
    return (
      <StringList
        items={block.s}
        onChange={(v) => onChange({ ...block, s: v })}
        addLabel="添加段落"
        placeholder="段落文本（支持 {{icon:name}} 图标语法）"
      />
    );
  }
  return (
    <TextArea
      value={block.s}
      onChange={(v) => onChange({ ...block, s: v })}
      rows={4}
      placeholder="正文文本（支持 {{icon:name}} 图标语法）"
    />
  );
}

function CalloutBlockFields({ block, onChange }: { block: Extract<Block, { t: "callout" }>; onChange: (b: Block) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Labeled label="语气">
        <SelectInput
          value={block.tone ?? "info"}
          onChange={(v) => onChange({ ...block, tone: v })}
          options={[
            { value: "info", label: "信息" },
            { value: "warn", label: "警告" },
            { value: "tip", label: "提示" },
          ]}
        />
      </Labeled>
      <Labeled label="标题">
        <TextInput value={block.title ?? ""} onChange={(v) => onChange({ ...block, title: v || undefined })} />
      </Labeled>
      <Labeled label="内容">
        <TextArea value={block.s} onChange={(v) => onChange({ ...block, s: v })} rows={3} />
      </Labeled>
    </div>
  );
}

function PlaceBlockFields({ block, onChange }: { block: Extract<Block, { t: "place" }>; onChange: (b: Block) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Labeled label="名称">
        <TextInput value={block.name} onChange={(v) => onChange({ ...block, name: v })} />
      </Labeled>
      <Labeled label="副标题 / 地址">
        <TextInput value={block.sub ?? ""} onChange={(v) => onChange({ ...block, sub: v || undefined })} />
      </Labeled>
      <Labeled label="描述">
        <TextArea value={block.copy ?? ""} onChange={(v) => onChange({ ...block, copy: v || undefined })} rows={2} />
      </Labeled>
    </div>
  );
}

function PlacesBlockFields({ block, onChange }: { block: Extract<Block, { t: "places" }>; onChange: (b: Block) => void }) {
  return (
    <ItemList
      items={block.items}
      onChange={(v) => onChange({ ...block, items: v })}
      addLabel="添加地点"
      create={() => ({ name: "" }) as Place}
      renderItem={({ item, index, set, remove, move }) => (
        <div className="flex items-start gap-2">
          <div className="flex-1 flex flex-col gap-2">
            <TextInput value={item.name} onChange={(v) => set({ name: v })} placeholder="地点名" />
            <TextInput value={item.sub ?? ""} onChange={(v) => set({ sub: v || undefined })} placeholder="副标题" />
            <TextArea value={item.copy ?? ""} onChange={(v) => set({ copy: v || undefined })} rows={2} placeholder="描述" />
          </div>
          <MoveButtons up={index > 0} down={index < block.items.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
          <RemoveButton onClick={remove} />
        </div>
      )}
    />
  );
}

function PointsBlockFields({ block, onChange }: { block: Extract<Block, { t: "points" }>; onChange: (b: Block) => void }) {
  return (
    <ItemList
      items={block.items}
      onChange={(v) => onChange({ ...block, items: v })}
      addLabel="添加要点"
      create={() => ({ k: "", v: "" })}
      renderItem={({ item, index, set, remove, move }) => (
        <div className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <TextInput value={item.k} onChange={(v) => set({ k: v })} placeholder="键" />
            <TextInput value={item.v} onChange={(v) => set({ v: v })} placeholder="值" />
          </div>
          <MoveButtons up={index > 0} down={index < block.items.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
          <RemoveButton onClick={remove} />
        </div>
      )}
    />
  );
}

function ChecklistBlockFields({ block, onChange }: { block: Extract<Block, { t: "checklist" }>; onChange: (b: Block) => void }) {
  const groups = block.groups ?? [];
  return (
    <ItemList
      items={groups}
      onChange={(v) => onChange({ ...block, groups: v })}
      addLabel="添加分组"
      create={() => ({ title: "", items: [""] })}
      renderItem={({ item, index, set, remove, move }) => (
        <div className="flex flex-col gap-2 border rounded p-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <TextInput value={item.title ?? ""} onChange={(v) => set({ title: v || undefined })} placeholder="分组标题（可选）" />
            </div>
            <MoveButtons up={index > 0} down={index < groups.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
            <RemoveButton onClick={remove} />
          </div>
          <StringList items={item.items} onChange={(v) => set({ items: v })} addLabel="添加条目" placeholder="清单项" />
        </div>
      )}
    />
  );
}

function TableBlockFields({ block, onChange }: { block: Extract<Block, { t: "table" }>; onChange: (b: Block) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Labeled label="表头">
        <StringList items={block.head} onChange={(v) => onChange({ ...block, head: v })} addLabel="添加列" placeholder="列名" />
      </Labeled>
      <Labeled label="行">
        <ItemList
          items={block.rows}
          onChange={(v) => onChange({ ...block, rows: v })}
          addLabel="添加行"
          create={() => block.head.map(() => "")}
          renderItem={({ item, index, set, remove, move }) => (
            <div className="flex items-start gap-2">
              <div
                className="flex-1 grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.max(block.head.length, 1)}, minmax(0, 1fr))` }}
              >
                {item.map((cell, ci) => (
                  <TextInput
                    key={ci}
                    value={cell}
                    onChange={(v) => {
                      const next = [...item];
                      next[ci] = v;
                      set(next);
                    }}
                    placeholder={`第${ci + 1}列`}
                  />
                ))}
              </div>
              <MoveButtons up={index > 0} down={index < block.rows.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
              <RemoveButton onClick={remove} />
            </div>
          )}
        />
      </Labeled>
    </div>
  );
}

function DayBlockFields({ block, onChange }: { block: Extract<Block, { t: "day" }>; onChange: (b: Block) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <Labeled label="序号">
          <TextInput value={block.no} onChange={(v) => onChange({ ...block, no: v })} />
        </Labeled>
        <Labeled label="日期">
          <TextInput value={block.date ?? ""} onChange={(v) => onChange({ ...block, date: v || undefined })} placeholder="如 2026-08-01" />
        </Labeled>
        <Labeled label="里程">
          <TextInput value={block.km ?? ""} onChange={(v) => onChange({ ...block, km: v || undefined })} placeholder="如 320km" />
        </Labeled>
      </div>
      <Labeled label="标题">
        <TextInput value={block.title} onChange={(v) => onChange({ ...block, title: v })} />
      </Labeled>
      <Labeled label="日程项">
        <ItemList
          items={block.items}
          onChange={(v) => onChange({ ...block, items: v })}
          addLabel="添加日程项"
          create={() => ({}) as DayItem}
          renderItem={({ item, index, set, remove, move }) => (
            <div className="flex flex-col gap-2 border rounded p-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <TextInput value={item.time ?? ""} onChange={(v) => set({ time: v || undefined })} placeholder="时间" />
                  <TextInput value={item.s ?? ""} onChange={(v) => set({ s: v || undefined })} placeholder="活动" />
                </div>
                <MoveButtons up={index > 0} down={index < block.items.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
                <RemoveButton onClick={remove} />
              </div>
              <Labeled label="地点">
                <PlaceFields value={item.place} onChange={(p) => set({ place: p })} />
              </Labeled>
              <Labeled label="标签（逗号分隔）">
                <TextInput
                  value={(item.tags ?? []).join(", ")}
                  onChange={(v) => set({ tags: v.split(",").map((x) => x.trim()).filter(Boolean) })}
                />
              </Labeled>
              <Labeled label="备注">
                <TextArea value={item.note ?? ""} onChange={(v) => set({ note: v || undefined })} rows={2} />
              </Labeled>
            </div>
          )}
        />
      </Labeled>
      <Labeled label="住宿">
        <PlaceFields value={block.sleep} onChange={(p) => onChange({ ...block, sleep: p })} />
      </Labeled>
      <Labeled label="餐饮">
        <ItemList
          items={block.eat ?? []}
          onChange={(v) => onChange({ ...block, eat: v })}
          addLabel="添加餐饮"
          create={() => ({ name: "" })}
          renderItem={({ item, index, set, remove, move }) => (
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <PlaceFields value={item} onChange={set} />
              </div>
              <MoveButtons up={index > 0} down={index < (block.eat ?? []).length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
              <RemoveButton onClick={remove} />
            </div>
          )}
        />
      </Labeled>
      <Labeled label="当日备注">
        <TextArea value={block.note ?? ""} onChange={(v) => onChange({ ...block, note: v || undefined })} rows={2} />
      </Labeled>
    </div>
  );
}

function FoodBlockFields({ block, onChange }: { block: Extract<Block, { t: "food" }>; onChange: (b: Block) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Labeled label="城市">
          <TextInput value={block.city} onChange={(v) => onChange({ ...block, city: v })} />
        </Labeled>
        <Labeled label="旗帜 / 标识">
          <TextInput value={block.flag ?? ""} onChange={(v) => onChange({ ...block, flag: v || undefined })} placeholder="如 🍜" />
        </Labeled>
      </div>
      <Labeled label="美食项">
        <ItemList
          items={block.items}
          onChange={(v) => onChange({ ...block, items: v })}
          addLabel="添加美食"
          create={() => ({ name: "" } as FoodItem)}
          renderItem={({ item, index, set, remove, move }) => (
            <div className="flex flex-col gap-2 border rounded p-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <TextInput value={item.name} onChange={(v) => set({ name: v })} placeholder="名称" />
                  <TextInput value={item.price ?? ""} onChange={(v) => set({ price: v || undefined })} placeholder="价格" />
                </div>
                <MoveButtons up={index > 0} down={index < block.items.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
                <RemoveButton onClick={remove} />
              </div>
              <TextInput value={item.addr ?? ""} onChange={(v) => set({ addr: v || undefined })} placeholder="地址" />
              <TextArea value={item.note ?? ""} onChange={(v) => set({ note: v || undefined })} rows={2} placeholder="备注" />
            </div>
          )}
        />
      </Labeled>
    </div>
  );
}

function BudgetBlockFields({ block, onChange }: { block: Extract<Block, { t: "budget" }>; onChange: (b: Block) => void }) {
  return (
    <ItemList
      items={block.cells}
      onChange={(v) => onChange({ ...block, cells: v })}
      addLabel="添加条目"
      create={() => ({ k: "", v: "" } as BudgetCell)}
      renderItem={({ item, index, set, remove, move }) => (
        <div className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <TextInput value={item.k} onChange={(v) => set({ k: v })} placeholder="项目" />
            <TextInput value={item.v} onChange={(v) => set({ v: v })} placeholder="数值" />
            <TextInput value={item.n ?? ""} onChange={(v) => set({ n: v || undefined })} placeholder="备注" />
          </div>
          <MoveButtons up={index > 0} down={index < block.cells.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
          <RemoveButton onClick={remove} />
        </div>
      )}
    />
  );
}

function SummaryBlockFields({ block, onChange }: { block: Extract<Block, { t: "summary" }>; onChange: (b: Block) => void }) {
  return (
    <ItemList
      items={block.rows}
      onChange={(v) => onChange({ ...block, rows: v })}
      addLabel="添加项"
      create={() => ({ k: "", v: "" })}
      renderItem={({ item, index, set, remove, move }) => (
        <div className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <TextInput value={item.k} onChange={(v) => set({ k: v })} placeholder="键" />
            <TextInput value={item.v} onChange={(v) => set({ v: v })} placeholder="值" />
          </div>
          <MoveButtons up={index > 0} down={index < block.rows.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
          <RemoveButton onClick={remove} />
        </div>
      )}
    />
  );
}

function GalleryBlockFields({ block, onChange }: { block: Extract<Block, { t: "gallery" }>; onChange: (b: Block) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Labeled label="说明">
        <TextInput value={block.caption ?? ""} onChange={(v) => onChange({ ...block, caption: v || undefined })} />
      </Labeled>
      <ItemList
        items={block.items}
        onChange={(v) => onChange({ ...block, items: v })}
        addLabel="添加图片项"
        create={() => ({ title: "" } as GalleryItem)}
        renderItem={({ item, index, set, remove, move }) => (
          <div className="flex flex-col gap-2 border rounded p-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <TextInput value={item.title ?? ""} onChange={(v) => set({ title: v || undefined })} placeholder="标题" />
                <TextInput value={item.label ?? ""} onChange={(v) => set({ label: v || undefined })} placeholder="标签" />
              </div>
              <MoveButtons up={index > 0} down={index < block.items.length - 1} onUp={() => move(-1)} onDown={() => move(1)} />
              <RemoveButton onClick={remove} />
            </div>
            <TextInput value={item.gradient ?? ""} onChange={(v) => set({ gradient: v || undefined })} placeholder="渐变色（如 from-pink-500 to-orange-400）" />
            <TextInput value={item.src ?? ""} onChange={(v) => set({ src: v || undefined })} placeholder="图片地址（可选）" />
          </div>
        )}
      />
    </div>
  );
}

function BlockFields({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.t) {
    case "text":
      return <TextBlockFields block={block} onChange={onChange} />;
    case "callout":
      return <CalloutBlockFields block={block} onChange={onChange} />;
    case "place":
      return <PlaceBlockFields block={block} onChange={onChange} />;
    case "places":
      return <PlacesBlockFields block={block} onChange={onChange} />;
    case "points":
      return <PointsBlockFields block={block} onChange={onChange} />;
    case "checklist":
      return <ChecklistBlockFields block={block} onChange={onChange} />;
    case "table":
      return <TableBlockFields block={block} onChange={onChange} />;
    case "day":
      return <DayBlockFields block={block} onChange={onChange} />;
    case "food":
      return <FoodBlockFields block={block} onChange={onChange} />;
    case "budget":
      return <BudgetBlockFields block={block} onChange={onChange} />;
    case "summary":
      return <SummaryBlockFields block={block} onChange={onChange} />;
    case "gallery":
      return <GalleryBlockFields block={block} onChange={onChange} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Block card + section editor + guide meta + preview                */
/* ------------------------------------------------------------------ */

function BlockCard({
  block,
  onChange,
  onDelete,
  onMove,
}: {
  block: Block;
  onChange: (nb: Block) => void;
  onDelete: () => void;
  onMove: { up: boolean; down: boolean; onUp: () => void; onDown: () => void };
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{blockTypeLabels[block.t]}</span>
        <div className="flex items-center gap-1">
          <MoveButtons up={onMove.up} down={onMove.down} onUp={onMove.onUp} onDown={onMove.onDown} />
          <RemoveButton onClick={onDelete} />
        </div>
      </div>
      <BlockFields block={block} onChange={onChange} />
    </div>
  );
}

function AddBlockControl({ onAdd }: { onAdd: (t: Block["t"]) => void }) {
  const [t, setT] = useState<Block["t"]>("text");
  return (
    <div className="flex items-center gap-2">
      <SelectInput value={t} onChange={setT} options={blockTypeOptions} />
      <Button variant="outline" size="sm" onClick={() => onAdd(t)}>
        + 添加区块
      </Button>
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  onDelete,
  onMove,
}: {
  section: Section;
  onChange: (ns: Section) => void;
  onDelete: () => void;
  onMove: { up: boolean; down: boolean; onUp: () => void; onDown: () => void };
}) {
  const setBlock = (bi: number, nb: Block) =>
    onChange({ ...section, blocks: section.blocks.map((x, j) => (j === bi ? nb : x)) });
  const removeBlock = (bi: number) =>
    onChange({ ...section, blocks: section.blocks.filter((_, j) => j !== bi) });
  const moveBlock = (bi: number, dir: -1 | 1) =>
    onChange({ ...section, blocks: move(section.blocks, bi, dir) });

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold">分区</span>
        <div className="flex items-center gap-1">
          <MoveButtons up={onMove.up} down={onMove.down} onUp={onMove.onUp} onDown={onMove.onDown} />
          <RemoveButton onClick={onDelete} />
        </div>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Labeled label="标题">
          <TextInput value={section.title} onChange={(v) => onChange({ ...section, title: v })} />
        </Labeled>
        <Labeled label="图标">
          <TextInput value={section.icon ?? ""} onChange={(v) => onChange({ ...section, icon: v || undefined })} placeholder="{{icon:map}}" />
        </Labeled>
        <Labeled label="导语">
          <TextInput value={section.lead ?? ""} onChange={(v) => onChange({ ...section, lead: v || undefined })} />
        </Labeled>
      </div>
      <div className="flex flex-col gap-3">
        {section.blocks.map((b, bi) => (
          <BlockCard
            key={bi}
            block={b}
            onChange={(nb) => setBlock(bi, nb)}
            onDelete={() => removeBlock(bi)}
            onMove={{
              up: bi > 0,
              down: bi < section.blocks.length - 1,
              onUp: () => moveBlock(bi, -1),
              onDown: () => moveBlock(bi, 1),
            }}
          />
        ))}
      </div>
      <div className="mt-3">
        <AddBlockControl onAdd={(t) => onChange({ ...section, blocks: [...section.blocks, createDefaultBlock(t)] })} />
      </div>
    </div>
  );
}

function GuideMetaEditor({
  guide,
  onChange,
}: {
  guide: Guide;
  onChange: (patch: Partial<Guide>) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Labeled label="标题">
          <TextInput value={guide.title} onChange={(v) => onChange({ ...guide, title: v })} />
        </Labeled>
        <Labeled label="状态">
          <SelectInput
            value={guide.status ?? "published"}
            onChange={(v) => onChange({ ...guide, status: v })}
            options={[
              { value: "published", label: "发布" },
              { value: "draft", label: "草稿" },
            ]}
          />
        </Labeled>
      </div>
      <Labeled label="副标题">
        <TextInput value={guide.subtitle ?? ""} onChange={(v) => onChange({ ...guide, subtitle: v || undefined })} />
      </Labeled>
      <div className="grid grid-cols-2 gap-2">
        <Labeled label="Emoji">
          <TextInput value={guide.emoji ?? ""} onChange={(v) => onChange({ ...guide, emoji: v || undefined })} placeholder="{{icon:compass}} 或 🧭" />
        </Labeled>
        <Labeled label="封面渐变">
          <TextInput value={guide.color ?? ""} onChange={(v) => onChange({ ...guide, color: v || undefined })} placeholder="如 linear-gradient(135deg,#xxx,#yyy)" />
        </Labeled>
      </div>
      <Labeled label="徽章">
        <TextInput value={guide.badge ?? ""} onChange={(v) => onChange({ ...guide, badge: v || undefined })} placeholder="{{icon:car}} 自驾" />
      </Labeled>
    </div>
  );
}

function GuidePreview({ guide }: { guide: Guide }) {
  return (
    <div className="flex flex-col gap-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{guide.title}</h1>
        {guide.subtitle && <p className="mt-1 text-muted-foreground">{guide.subtitle}</p>}
      </div>
      {guide.sections.map((s, si) => (
        <section key={si}>
          <h2 className="mb-3 flex items-center gap-2 border-l-2 border-primary pl-3 text-xl font-bold">
            {s.title}
          </h2>
          <div className="flex flex-col gap-4">
            {s.blocks.map((b, bi) => (
              <BlockRenderer key={bi} block={b} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main editor                                                       */
/* ------------------------------------------------------------------ */

export function GuideEditor({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  const [draft, setDraft] = useState<Guide>(() => JSON.parse(JSON.stringify(guide)));
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

  const patchGuide = (patch: Partial<Guide>) => setDraft((d) => ({ ...d, ...patch }));
  const updateSection = (si: number, ns: Section) =>
    setDraft((d) => ({ ...d, sections: d.sections.map((s, i) => (i === si ? ns : s)) }));
  const addSection = () =>
    setDraft((d) => ({ ...d, sections: [...d.sections, { title: "新分区", blocks: [] }] }));
  const removeSection = (si: number) =>
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== si) }));
  const moveSection = (si: number, dir: -1 | 1) =>
    setDraft((d) => ({ ...d, sections: move(d.sections, si, dir) }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/guide/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide: draft }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        toast.success("已保存，站点正在重建…");
      } else {
        toast.error("保存失败：" + (data.error ?? String(res.status)));
      }
    } catch {
      toast.error("保存失败：网络错误");
    } finally {
      setSaving(false);
    }
  };

  const tabCls = (active: boolean) =>
    "rounded px-3 py-1 text-sm font-medium " +
    (active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent");

  return (
    <div>
      <div className="sticky top-[60px] z-40 border-y bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between gap-2 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">编辑模式</span>
            <div className="flex rounded-md border p-0.5">
              <button className={tabCls(mode === "edit")} onClick={() => setMode("edit")}>
                编辑
              </button>
              <button className={tabCls(mode === "preview")} onClick={() => setMode("preview")}>
                预览
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              退出
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "保存中…" : "保存"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {mode === "preview" ? (
          <GuidePreview guide={draft} />
        ) : (
          <div className="flex flex-col gap-5">
            <GuideMetaEditor guide={draft} onChange={patchGuide} />
            {draft.sections.map((s, si) => (
              <SectionEditor
                key={si}
                section={s}
                onChange={(ns) => updateSection(si, ns)}
                onDelete={() => removeSection(si)}
                onMove={{
                  up: si > 0,
                  down: si < draft.sections.length - 1,
                  onUp: () => moveSection(si, -1),
                  onDown: () => moveSection(si, 1),
                }}
              />
            ))}
            <Button variant="outline" onClick={addSection}>
              + 添加分区
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
