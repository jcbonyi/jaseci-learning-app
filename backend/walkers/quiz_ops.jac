"""quiz_ops.jac - quiz generation and evaluation"""

from models.quiz import quiz;

walker generate_quiz {
    has concept_name: str;

    can generate with `root entry {
        # Generate concept-specific quiz questions based on concept name
        questions = [];
        
        if self.concept_name == "Walkers" {
            questions = [
                {
                    "q": "What is a Walker in Jac?",
                    "type": "multiple",
                    "options": ["A data structure", "A traversal agent that moves through graphs", "A type of variable", "A loop construct"],
                    "answer": "A traversal agent that moves through graphs"
                },
                {
                    "q": "How do you define a walker in Jac?",
                    "type": "multiple",
                    "options": ["Using 'def walker'", "Using 'walker name { }'", "Using 'class Walker'", "Using 'create walker'"],
                    "answer": "Using 'walker name { }'"
                },
                {
                    "q": "What keyword is used to move a walker to connected nodes?",
                    "type": "multiple",
                    "options": ["goto", "visit", "move", "traverse"],
                    "answer": "visit"
                }
            ];
        } elif self.concept_name == "Nodes & edges" {
            questions = [
                {
                    "q": "What is a Node in Jac?",
                    "type": "multiple",
                    "options": ["A function", "A vertex in a graph that can hold data", "A loop variable", "An import statement"],
                    "answer": "A vertex in a graph that can hold data"
                },
                {
                    "q": "What operator connects two nodes with an edge?",
                    "type": "multiple",
                    "options": ["->", "++>", "=>", "-->"],
                    "answer": "++>"
                },
                {
                    "q": "Can edges have their own data/properties in Jac?",
                    "type": "multiple",
                    "options": ["No, edges are just connections", "Yes, edges can have has variables", "Only in version 2.0", "Only numeric properties"],
                    "answer": "Yes, edges can have has variables"
                }
            ];
        } elif self.concept_name == "Jac syntax" {
            questions = [
                {
                    "q": "What is Jac?",
                    "type": "multiple",
                    "options": ["A JavaScript framework", "A data-spatial programming language", "A database query language", "A CSS preprocessor"],
                    "answer": "A data-spatial programming language"
                },
                {
                    "q": "How do you declare a variable with a type in Jac?",
                    "type": "multiple",
                    "options": ["var x: int", "has x: int", "let x: int", "int x"],
                    "answer": "has x: int"
                },
                {
                    "q": "What is the entry point of a Jac graph?",
                    "type": "multiple",
                    "options": ["main()", "root", "start", "init"],
                    "answer": "root"
                }
            ];
        } elif self.concept_name == "GraphOps" {
            questions = [
                {
                    "q": "What does GraphOps refer to in Jac?",
                    "type": "multiple",
                    "options": ["Database operations", "Graph traversal and manipulation operations", "File system operations", "Network operations"],
                    "answer": "Graph traversal and manipulation operations"
                },
                {
                    "q": "How do you traverse to connected nodes in Jac?",
                    "type": "multiple",
                    "options": ["Using SQL queries", "Using the visit keyword and edge operators", "Using for loops only", "Using callbacks"],
                    "answer": "Using the visit keyword and edge operators"
                },
                {
                    "q": "What does the --> operator do?",
                    "type": "multiple",
                    "options": ["Creates a new node", "Traverses outgoing edges", "Deletes a connection", "Compares values"],
                    "answer": "Traverses outgoing edges"
                }
            ];
        } elif self.concept_name == "OSP" {
            questions = [
                {
                    "q": "What does OSP stand for in Jac?",
                    "type": "multiple",
                    "options": ["Object-Spatial Programming", "Object-Oriented Protocol", "Open Source Platform", "Output Stream Processing"],
                    "answer": "Object-Spatial Programming"
                },
                {
                    "q": "In OSP, data is organized as:",
                    "type": "multiple",
                    "options": ["Tables and rows", "Nodes and edges in a graph", "Files and folders", "Arrays and objects"],
                    "answer": "Nodes and edges in a graph"
                },
                {
                    "q": "What is a key benefit of OSP?",
                    "type": "multiple",
                    "options": ["Faster compilation", "Natural representation of relationships", "Smaller file sizes", "Better error messages"],
                    "answer": "Natural representation of relationships"
                }
            ];
        } elif self.concept_name == "byLLM" {
            questions = [
                {
                    "q": "What is byLLM in Jac?",
                    "type": "multiple",
                    "options": ["A database connector", "A decorator for LLM-backed functionality", "A testing framework", "A logging utility"],
                    "answer": "A decorator for LLM-backed functionality"
                },
                {
                    "q": "What does byLLM allow you to do?",
                    "type": "multiple",
                    "options": ["Connect to databases", "Generate code using AI language models", "Create UI components", "Run tests automatically"],
                    "answer": "Generate code using AI language models"
                },
                {
                    "q": "byLLM is most useful for:",
                    "type": "multiple",
                    "options": ["Static type checking", "Natural language processing tasks", "File compression", "Memory management"],
                    "answer": "Natural language processing tasks"
                }
            ];
        } elif self.concept_name == "AI agents" {
            questions = [
                {
                    "q": "What are AI agents in Jac?",
                    "type": "multiple",
                    "options": ["Simple variables", "Autonomous entities that can make decisions", "Database tables", "Configuration files"],
                    "answer": "Autonomous entities that can make decisions"
                },
                {
                    "q": "AI agents in Jac often use:",
                    "type": "multiple",
                    "options": ["Only hardcoded rules", "byLLM decorators for intelligent behavior", "SQL queries", "Regular expressions"],
                    "answer": "byLLM decorators for intelligent behavior"
                },
                {
                    "q": "What makes Jac good for building AI agents?",
                    "type": "multiple",
                    "options": ["Fast compilation", "Graph-based data model and LLM integration", "Small file size", "Cross-platform support"],
                    "answer": "Graph-based data model and LLM integration"
                }
            ];
        } else {
            # Default generic questions for any concept
            questions = [
                {
                    "q": f"What best describes {self.concept_name} in Jac?",
                    "type": "multiple",
                    "options": ["A core language feature", "An external library", "A deprecated feature", "A configuration option"],
                    "answer": "A core language feature"
                },
                {
                    "q": f"Where would you typically use {self.concept_name}?",
                    "type": "multiple",
                    "options": ["In graph-based applications", "Only in web servers", "Only in CLI tools", "It cannot be used"],
                    "answer": "In graph-based applications"
                },
                {
                    "q": "What programming paradigm does Jac primarily use?",
                    "type": "multiple",
                    "options": ["Object-Oriented only", "Functional only", "Data Spatial with graph structures", "Procedural only"],
                    "answer": "Data Spatial with graph structures"
                }
            ];
        }
        
        q = quiz(
            concept=self.concept_name,
            questions=questions,
            passing_score=70
        );
        here ++> q;
        report {"quiz_id": str(id(q)), "concept": self.concept_name, "questions": q.questions};
    }
}

walker evaluate_answer {
    has quiz_id: str;
    has submitted_answers: dict;

    can evaluate with `root entry {
        # Find quiz by searching
        q = None;
        for node in [-->(`?quiz)] {
            if str(id(node)) == self.quiz_id {
                q = node;
                break;
            }
        }

        if q is None {
            report {"error": "quiz_not_found"};
            disengage;
        }

        # Evaluate answers: compare submitted answers to correct answers
        score = 0;
        total = len(q.questions);
        i = 0;
        for qitem in q.questions {
            qtype = "";
            if "type" in qitem {
                qtype = qitem["type"];
            }
            # Handle both 'mcq' and 'multiple' type questions
            if qtype == "mcq" or qtype == "multiple" {
                answer = "";
                if "answer" in qitem {
                    answer = qitem["answer"];
                }
                submitted = "";
                idx_str = str(i);
                if idx_str in self.submitted_answers {
                    submitted = self.submitted_answers[idx_str];
                }
                if submitted == answer {
                    score = score + 1;
                }
            }
            i = i + 1;
        }
        pct = 0;
        if total > 0 {
            pct = (score * 100) / total;
        }
        report {"score": pct, "correct": score, "total": total};
    }
}
