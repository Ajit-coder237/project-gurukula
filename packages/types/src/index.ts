export type TeachingMode =
  | "lecture"
  | "socratic"
  | "problem_solving"
  | "quiz"
  | "revision"
  | "exam_prep";

export type ExplanationStyle =
  | "simple"
  | "standard_university"
  | "exam_focused"
  | "intuitive"
  | "formal_proof";

export type WhiteboardCommandType =
  | "write_text"
  | "draw_arrow"
  | "draw_box"
  | "draw_graph_axes"
  | "plot_points"
  | "connect_concepts"
  | "clear_region"
  | "highlight_region"
  | "show_formula";

export interface SourceCitation {
  chunkId: string;
  materialId: string;
  title: string;
  snippet: string;
}

export interface TutorResponsePayload {
  answer: string;
  checkForUnderstanding: string;
  practiceTask: string;
  citations: SourceCitation[];
  whiteboardActions: WhiteboardCommand[];
  recommendAnimation?: AnimationRequest;
}

export interface WhiteboardCommand {
  type: WhiteboardCommandType;
  payload: Record<string, unknown>;
  delayMs?: number;
}

export interface AnimationRequest {
  conceptType:
    | "graphing_functions"
    | "calculus_intuition"
    | "geometric_transformations"
    | "probability_statistics"
    | "algorithm_data_structures";
  prompt: string;
}

export interface MasteryDelta {
  topicId: string;
  confidenceDelta: number;
  evidence: string;
  misconceptionCategory?: string;
}
