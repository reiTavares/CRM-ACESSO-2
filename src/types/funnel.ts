export type Funnel = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  is_default: boolean | null;
}

export type PipelineStage = {
  id: number;
  funnel_id: number;
  name: string;
  position: number;
  created_at: string;
}
