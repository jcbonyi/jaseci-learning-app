"""mastery_ops.jac - update mastery, compute edges, and recommend study"""

from models.user import user;
from models.concept import concept;

walker update_mastery {
    has user_id: str;
    has concept_name: str;
    has score: int;

    can update with `root entry {
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

        prev = 0;
        if self.concept_name in u.concept_scores {
            prev = u.concept_scores[self.concept_name];
        }
        newv = max(prev, self.score);
        u.concept_scores[self.concept_name] = newv;

        # Find concept node
        c = None;
        for node in [-->(`?concept)] {
            if node.name == self.concept_name {
                c = node;
                break;
            }
        }

        # Update mastery edge if passed mastery score
        if c is not None and newv >= c.mastery_score {
            u ++> c;
        }

        # Unlock lessons if prerequisites satisfied
        if c is not None {
            for l in c.lessons {
                l.unlocked = True;
            }
        }

        report {"status": "updated", "concept": self.concept_name, "score": newv};
    }
}

walker recommend_next {
    has user_id: str;

    can recommend with `root entry {
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

        # Return weakest two concepts using manual sort
        keys = list(u.concept_scores.keys());
        scores = [];
        for k in keys {
            scores.append([k, u.concept_scores[k]]);
        }

        # Simple bubble sort by score
        n = len(scores);
        for i in range(n) {
            for j in range(0, n - i - 1) {
                if scores[j][1] > scores[j + 1][1] {
                    temp = scores[j];
                    scores[j] = scores[j + 1];
                    scores[j + 1] = temp;
                }
            }
        }

        rec = [];
        count = min(2, len(scores));
        for i in range(count) {
            rec.append(scores[i][0]);
        }
        report {"recommendations": rec};
    }
}

walker save_note {
    has user_id: str;
    has concept_name: str;
    has note_text: str;

    can save with `root entry {
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

        # Save the note for this concept
        u.notes[self.concept_name] = self.note_text;
        
        report {"status": "saved", "concept": self.concept_name};
    }
}

walker get_notes {
    has user_id: str;

    can get with `root entry {
        u = None;
        for node in [-->(`?user)] {
            if node.id == self.user_id {
                u = node;
                break;
            }
        }
        if u is None {
            report {"error": "user_not_found", "notes": {}};
            disengage;
        }

        report {"notes": u.notes};
    }
}