"""concept.jac - concept node model"""

node concept {
    has name: str = "";
    has description: str = "";
    has difficulty: int = 1;
    has required_score: int = 70;
    has mastery_score: int = 85;
    has lessons: list = [];
}

edge prerequisite {
    has required_score: int = 70;
}

edge mastery {
    has score: int = 0;
}

edge related_to {}
