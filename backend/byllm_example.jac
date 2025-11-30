"""byllm_example.jac - Example demonstrating LLM integration"""

import models.quiz;

walker quiz_generator_by_llm {
    has concept_name: str;

    can generate with `root entry {
        # Create quiz node with sample questions
        qnode = quiz(
            concept=self.concept_name,
            questions=[
                {"q": "Describe the concept.", "type": "short"},
                {"q": "What are the key components?", "type": "short"}
            ]
        );
        return {"quiz_id": str(id(qnode)), "questions": qnode.questions};
    }
}
