export interface CollectorFormProps {
  /** Called after a collector is created, with the one-time personal link. */
  onCreated: (link: string) => void;
}
