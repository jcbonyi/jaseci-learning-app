"""quiz.jac - quiz model"""

node quiz {
    has concept: str = "";
    has questions: list = [];
    has passing_score: int = 70;
}

node attempt {
    has user: str = "";
    has quiz: str = "";
    has score: int = 0;
    has answers: dict = {};
}
