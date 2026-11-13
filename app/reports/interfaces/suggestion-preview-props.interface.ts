import type { ItemSuggestion } from "./item-suggestion.interface";

export interface SuggestionPreviewProps {
  suggestion: ItemSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}
