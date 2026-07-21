import { useContext } from "react";
import { ExperienceEngineContext } from "./ExperienceEngineContext";
export function useExperienceEngine() {
  const context = useContext(ExperienceEngineContext);
  if (!context) {
    throw new Error(
      "useExperienceEngine must be used inside ExperienceEngineProvider"
    );
  }
  return context;
}