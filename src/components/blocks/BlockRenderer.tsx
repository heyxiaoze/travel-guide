import type { Block } from "@/types/guide";
import { TextBlockView, PointsView, SummaryView } from "./Text";
import { CalloutView } from "./Callout";
import { PlaceBlockView, PlacesBlockView } from "./Place";
import { ChecklistView } from "./Checklist";
import { TableView } from "./Table";
import { DayView } from "./Day";
import { FoodView } from "./Food";
import { BudgetView } from "./Budget";
import { GalleryView } from "./Gallery";

export function BlockRenderer({
  block,
  dayIndex,
}: {
  block: Block;
  dayIndex?: number;
}) {
  switch (block.t) {
    case "text":
      return <TextBlockView block={block} />;
    case "callout":
      return <CalloutView block={block} />;
    case "place":
      return <PlaceBlockView block={block} />;
    case "places":
      return <PlacesBlockView block={block} />;
    case "points":
      return <PointsView block={block} />;
    case "checklist":
      return <ChecklistView block={block} />;
    case "table":
      return <TableView block={block} />;
    case "day":
      return <DayView block={block} dayIndex={dayIndex} />;
    case "food":
      return <FoodView block={block} />;
    case "budget":
      return <BudgetView block={block} />;
    case "summary":
      return <SummaryView block={block} />;
    case "gallery":
      return <GalleryView block={block} />;
    default:
      return null;
  }
}
