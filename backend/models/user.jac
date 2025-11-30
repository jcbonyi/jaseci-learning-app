"""user.jac - user node model"""

node user {
    has id: str = "";
    has completed_lessons: list = [];
    has concept_scores: dict = {};
    has current_path: str = "default";
    has recommended_next: str = "";
    has notes: dict = {};  # concept_name -> note text
}
