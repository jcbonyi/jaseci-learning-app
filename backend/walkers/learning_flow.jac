"""learning_flow.jac - routing, progress tracking, and dashboard"""

from models.user import user;
from models.lesson import lesson;
from models.concept import concept;

walker get_next_lesson {
    has user_id: str;

    can find_lesson with `root entry {
        # Fetch user
        u = None;
        for node in [-->(`?user)] {
            if node.id == self.user_id {
                u = node;
                break;
            }
        }
        if u is None {
            report {"error": "user_not_found"};
            disengage;
        }

        # Recommendation logic: prefer unlocked lessons not yet completed       
        candidates = [];
        for l in [-->(`?lesson)] {
            if l.unlocked and l.title not in u.completed_lessons {
                candidates.append(l);
            }
        }

        # If none unlocked, unlock first available lesson
        if len(candidates) == 0 {
            for l in [-->(`?lesson)] {
                if l.title not in u.completed_lessons and not l.unlocked {      
                    l.unlocked = True;
                    candidates.append(l);
                    break;
                }
            }
        }

        if len(candidates) == 0 {
            # fallback: recommend a review of weakest concept
            weakest = {"name": "", "score": 999};
            keys = list(u.concept_scores.keys());
            for k in keys {
                v = u.concept_scores[k];
                if v < weakest["score"] {
                    weakest = {"name": k, "score": v};
                }
            }
            report {"recommended_review": weakest};
            disengage;
        }

        # Simple sort - get lesson with lowest difficulty
        next_lesson = candidates[0];
        for c in candidates {
            if c.difficulty < next_lesson.difficulty {
                next_lesson = c;
            }
        }

        concept_names = [];
        for c in next_lesson.concepts {
            concept_names.append(c.name);
        }
        report {"next_lesson": {"title": next_lesson.title, "concepts": concept_names, "difficulty": next_lesson.difficulty}};
    }
}

walker record_lesson_progress {
    has user_id: str;
    has lesson_title: str;
    has completed: bool;

    can record with `root entry {
        u = None;
        for node in [-->(`?user)] {
            if node.id == self.user_id {
                u = node;
                break;
            }
        }
        if u is None {
            report {"error": "user_not_found"};
            disengage;
        }

        l = None;
        for node in [-->(`?lesson)] {
            if node.title == self.lesson_title {
                l = node;
                break;
            }
        }
        if l is None {
            report {"error": "lesson_not_found"};
            disengage;
        }

        if self.completed {
            if l.title not in u.completed_lessons {
                u.completed_lessons.append(l.title);
            }
            # bump concept scores lightly per completion
            for c in l.concepts {
                name = c.name;
                prev = 0;
                if name in u.concept_scores {
                    prev = u.concept_scores[name];
                }
                newv = min(prev + 10, 100);
                u.concept_scores[name] = newv;
            }
        }
        report {"status": "recorded", "completed_lessons": u.completed_lessons};
    }
}

walker get_dashboard {
    has user_id: str;

    can get_data with `root entry {
        u = None;
        for node in [-->(`?user)] {
            if node.id == self.user_id {
                u = node;
                break;
            }
        }
        if u is None {
            report {"error": "user_not_found"};
            disengage;
        }

        # gather all concepts and their mastery for the user
        data = {};
        for c in [-->(`?concept)] {
            score = 0;
            if c.name in u.concept_scores {
                score = u.concept_scores[c.name];
            }
            data[c.name] = {"score": score, "required": c.required_score, "mastery": c.mastery_score};
        }
        report {"user": self.user_id, "completed_lessons": u.completed_lessons, "concepts": data};
    }
}
