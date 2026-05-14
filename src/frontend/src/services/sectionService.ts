/**
 * sectionService — thin re-export so pages can import from a dedicated module.
 * The full implementation lives in classService to keep schema logic co-located.
 */
export {
  createSection,
  deleteSection,
  getSections,
  updateSection,
} from "./classService";
