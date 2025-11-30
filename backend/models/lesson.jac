"""lesson.jac - lesson node model"""

node lesson {
    has title: str = "";
    has content: str = "";
    has detailed_content: str = "";
    has examples: list = [];
    has concepts: list = [];
    has difficulty: int = 1;
    has unlocked: bool = false;
}
