"""main.jac - All-in-one Jac tutor backend"""

# ============ NODE DEFINITIONS ============

node user {
    has id: str = "";
    has completed_lessons: list = [];
    has concept_scores: dict = {};
    has current_path: str = "default";
    has recommended_next: str = "";
    has notes: dict = {};
}

node concept {
    has name: str = "";
    has description: str = "";
    has detailed_content: str = "";
    has examples: list = [];
    has difficulty: int = 1;
    has required_score: int = 70;
    has mastery_score: int = 85;
    has lessons: list = [];
    has order: int = 0;
}

node lesson {
    has title: str = "";
    has content: str = "";
    has concepts: list = [];
    has difficulty: int = 1;
    has unlocked: bool = False;
}

node quiz {
    has concept: str = "";
    has questions: list = [];
    has passing_score: int = 70;
}

edge prerequisite {
    has required_score: int = 70;
}

edge mastery {
    has score: int = 0;
}

# ============ WALKERS ============

walker create_user {
    has user_id: str;

    can create with `root entry {
        # Initialize concepts if not present (always do this first)
        existing_concepts = [-->(`?concept)];
        if len(existing_concepts) == 0 {
            # Create core concept nodes with detailed content and examples
            c_syntax = concept(
                name="Jac syntax", 
                description="Jac language basics and syntax",
                detailed_content="Jac is a graph-based programming language that extends Python with spatial computing concepts. It introduces three key abstractions: nodes (data containers), edges (relationships between nodes), and walkers (agents that traverse the graph). Jac uses Python-like syntax with special keywords like node, walker, edge, and has for field declarations. Code blocks use curly braces and statements end with semicolons.",
                examples=[
                    {"title": "Basic Variable Declaration", "code": "has name: str = empty_string;\nhas count: int = 0;\nhas items: list = [];"},
                    {"title": "Simple Node Definition", "code": "node person {\n    has name: str;\n    has age: int = 0;\n}"},
                    {"title": "Control Flow", "code": "if score > 80 {\n    print(msg);\n} else {\n    print(other_msg);\n}"}
                ],
                difficulty=1, required_score=65, mastery_score=85, order=1
            );
            c_nodes = concept(
                name="Nodes & edges", 
                description="Creating and working with nodes & edges",
                detailed_content="Nodes are the fundamental building blocks that hold data in Jac. Each node type is defined with the node keyword followed by fields declared with has. Edges connect nodes to create graph structures. Generic edges use the ++> operator, while typed edges use :edge_type: syntax. Access connected nodes using --> for outgoing and <-- for incoming edges.",
                examples=[
                    {"title": "Define Node Types", "code": "node user {\n    has id: str;\n    has name: str;\n}\n\nnode post {\n    has title: str;\n    has content: str;\n}"},
                    {"title": "Create Edges", "code": "# Generic edge\nuser_node ++> post_node;\n\n# Access connected nodes\nall_posts = [user_node -->];"},
                    {"title": "Typed Edges", "code": "edge follows {\n    has since: str;\n}\n\n# Create typed edge\nuser1 ++> user2;"}
                ],
                difficulty=1, required_score=65, mastery_score=85, order=2
            );
            c_walkers = concept(
                name="Walkers", 
                description="How walkers operate in Jac",
                detailed_content="Walkers are mobile agents that traverse the graph and perform operations at each node. They are defined with the walker keyword and can have parameters (has), abilities (can), and entry/exit behaviors. Use visit to move to connected nodes, report to return data, and disengage to stop traversal. Walkers are spawned on nodes and automatically traverse based on their visit statements.",
                examples=[
                    {"title": "Basic Walker", "code": "walker greeter {\n    has message: str;\n    \n    can greet with `root entry {\n        report {msg: self.message};\n    }\n}"},
                    {"title": "Traversing Walker", "code": "walker visitor {\n    can process with user entry {\n        print(here.name);\n        visit [-->];\n    }\n}"},
                    {"title": "Walker with Conditions", "code": "walker finder {\n    has target: str;\n    \n    can search with `root entry {\n        for node in [-->] {\n            if node.name == self.target {\n                report node;\n                disengage;\n            }\n        }\n    }\n}"}
                ],
                difficulty=2, required_score=70, mastery_score=90, order=3
            );
            c_graphops = concept(
                name="GraphOps", 
                description="Graph operations and traversal",
                detailed_content="Graph operations in Jac provide powerful ways to query and manipulate the graph structure. Filter nodes by type using [-->(`?NodeType)], access edge properties, and perform complex traversals. The --> operator returns connected nodes, while -->: allows filtering by edge type. Combine with list comprehensions and conditions for sophisticated graph queries.",
                examples=[
                    {"title": "Filter by Node Type", "code": "# Get all user nodes\nusers = [-->(`?user)];\n\n# Get all lessons\nlessons = [root -->(`?lesson)];"},
                    {"title": "Edge Traversal", "code": "# Get nodes via edge type\nfollowers = [user -->:follows:-->];\n\n# Filter with conditions\nfor n in [-->(`?user)] {\n    if n.active { ... }\n}"},
                    {"title": "Complex Query", "code": "# Find users with high scores\ntop_users = [];\nfor u in [-->(`?user)] {\n    if u.score > 90 {\n        top_users.append(u);\n    }\n}"}
                ],
                difficulty=2, required_score=70, mastery_score=88, order=4
            );
            c_osp = concept(
                name="OSP", 
                description="Object-Spatial Graph concepts and patterns",
                detailed_content="Object-Spatial Programming (OSP) is Jac paradigm where code and data exist as spatial objects in a graph. The here keyword refers to the current node, self refers to the walker. OSP enables location-aware computation where behavior depends on where code executes in the graph. This creates natural patterns for distributed systems, state machines, and agent-based models.",
                examples=[
                    {"title": "Using here Context", "code": "walker updater {\n    can update with user entry {\n        # here is the current user node\n        here.last_login = now();\n        here ++> log_entry();\n    }\n}"},
                    {"title": "Spatial Abilities", "code": "node room {\n    has name: str;\n    \n    can describe with entry {\n        print(self.name);\n    }\n}"},
                    {"title": "State Machine Pattern", "code": "node state {\n    has name: str;\n}\n\nwalker fsm {\n    can transition with state entry {\n        print(here.name);\n        visit [-->(`?state)]:0;\n    }\n}"}
                ],
                difficulty=2, required_score=70, mastery_score=90, order=5
            );
            c_byLLM = concept(
                name="byLLM", 
                description="Using LLM-backed decorators and agents",
                detailed_content="The by llm() decorator in Jac enables AI-powered code generation at runtime. Decorate abilities with by llm() to have an LLM implement the logic based on the function signature, docstring, and context. This is powerful for tasks like text generation, classification, summarization, and creative content. Requires OPENAI_API_KEY environment variable.",
                examples=[
                    {"title": "Basic byLLM Usage", "code": "obj Summarizer {\n    can summarize(text: str) -> str\n        by llm(reason=True);\n}"},
                    {"title": "Quiz Generator", "code": "obj QuizMaker {\n    # Generate quiz questions\n    \n    can make_quiz(topic: str, count: int) -> list\n        by llm();\n}"},
                    {"title": "Sentiment Analyzer", "code": "obj Analyzer {\n    can analyze_sentiment(text: str) -> dict\n        by llm();\n}"}
                ],
                difficulty=3, required_score=75, mastery_score=90, order=6
            );
            c_agents = concept(
                name="AI agents", 
                description="Designing agents and byLLM usage",
                detailed_content="AI Agents in Jac combine walkers with LLM capabilities to create intelligent, autonomous graph traversers. Agents can make decisions about where to go, what data to process, and how to respond. By combining spatial awareness (OSP) with AI reasoning (byLLM), you can build sophisticated systems like chatbots, recommendation engines, and adaptive learning systems.",
                examples=[
                    {"title": "Simple Agent Walker", "code": "walker tutor_agent {\n    has question: str;\n    \n    can answer with concept entry {\n        response = generate_answer(\n            self.question, \n            here.detailed_content\n        );\n        report response;\n    }\n}"},
                    {"title": "Decision-Making Agent", "code": "walker advisor {\n    has user_level: int;\n    \n    can recommend with `root entry {\n        concepts = [-->(`?concept)];\n        suitable = [];\n        for c in concepts {\n            if c.difficulty <= self.user_level {\n                suitable.append(c);\n            }\n        }\n        report suitable;\n    }\n}"},
                    {"title": "Conversational Agent", "code": "walker chatbot {\n    has history: list = [];\n    has input: str;\n    \n    can respond with `root entry {\n        self.history.append(self.input);\n        reply = llm_generate(self.history);\n        report {reply: reply};\n    }\n}"}
                ],
                difficulty=3, required_score=75, mastery_score=92, order=7
            );

            # Attach concepts to root
            here ++> c_syntax;
            here ++> c_nodes;
            here ++> c_walkers;
            here ++> c_graphops;
            here ++> c_osp;
            here ++> c_byLLM;
            here ++> c_agents;

            # Create sample lessons with content and concepts
            l1 = lesson(
                title="Intro to Jac syntax", 
                content="Learn the fundamentals of Jac language. Jac is a graph-based programming language that extends Python. Key concepts include nodes (data containers), edges (relationships), and walkers (traversal agents). In Jac, you define nodes with 'node' keyword and walkers with 'walker' keyword. Variables are declared using 'has' keyword.", 
                concepts=["Jac syntax"],
                difficulty=1, 
                unlocked=True
            );
            l2 = lesson(
                title="Nodes & edges", 
                content="Nodes are the building blocks of Jac graphs. Create nodes with 'node NodeName { has field: type; }'. Edges connect nodes: 'source ++> target' creates a generic edge. Named edges: 'source +:edge_type:+> target'. Access connected nodes with '-->' operator.", 
                concepts=["Nodes & edges"],
                difficulty=1, 
                unlocked=False
            );
            l3 = lesson(
                title="Walkers deep-dive", 
                content="Walkers traverse the graph and perform operations. Define with 'walker WalkerName { has param: type; can method with NodeType entry { } }'. Spawn walkers on nodes. Use 'report' to return data. Use 'visit' to move to other nodes and 'disengage' to stop.", 
                concepts=["Walkers"],
                difficulty=2, 
                unlocked=False
            );
            l4 = lesson(
                title="GraphOps & OSP patterns", 
                content="Graph operations include filtering nodes '[-->(`?NodeType)]', edge traversal, and pattern matching. OSP (Object-Spatial Programming) treats code as spatial objects. Nodes have spatial relationships. Use abilities and can blocks for behavior.", 
                concepts=["GraphOps", "OSP"],
                difficulty=2, 
                unlocked=False
            );
            l5 = lesson(
                title="byLLM & Agents", 
                content="The byLLM decorator enables LLM-powered code generation. Decorate abilities with 'by llm()' to let AI implement them. Build intelligent agents that combine graph traversal with AI reasoning. Great for generating quizzes, summaries, and adaptive content.", 
                concepts=["byLLM", "AI agents"],
                difficulty=3, 
                unlocked=False
            );

            # Attach lessons to root
            here ++> l1;
            here ++> l2;
            here ++> l3;
            here ++> l4;
            here ++> l5;
        }

        # Check if user already exists
        users = [-->(`?user)];
        for u in users {
            if u.id == self.user_id {
                report {
                    "status": "exists",
                    "user": self.user_id
                };
                disengage;
            }
        }

        # Create new user
        new_u = user(id=self.user_id, completed_lessons=[], concept_scores={}); 
        here ++> new_u;

        report {
            "status": "created",
            "user": self.user_id
        };
    }
}


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

        report {"next_lesson": {
            "title": next_lesson.title, 
            "difficulty": next_lesson.difficulty,
            "content": next_lesson.content,
            "concepts": next_lesson.concepts,
            "unlocked": next_lesson.unlocked
        }};
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
        concept_list = [];
        for c in [-->(`?concept)] {
            score = 0;
            if c.name in u.concept_scores {
                score = u.concept_scores[c.name];
            }
            concept_data = {
                "name": c.name,
                "score": score, 
                "required": c.required_score, 
                "mastery": c.mastery_score,
                "description": c.description,
                "detailed_content": c.detailed_content,
                "examples": c.examples,
                "difficulty": c.difficulty,
                "order": c.order
            };
            data[c.name] = concept_data;
            concept_list.append(concept_data);
        }
        
        # Sort concept_list by order
        n = len(concept_list);
        for i in range(n) {
            for j in range(0, n - i - 1) {
                if concept_list[j]["order"] > concept_list[j + 1]["order"] {
                    temp = concept_list[j];
                    concept_list[j] = concept_list[j + 1];
                    concept_list[j + 1] = temp;
                }
            }
        }
        
        report {"user": self.user_id, "completed_lessons": u.completed_lessons, "concepts": data, "concept_order": concept_list};
    }
}

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

walker generate_quiz {
    has concept_name: str;

    can generate with `root entry {
        # Find the concept to generate questions for
        target_concept = None;
        for c in [-->(`?concept)] {
            if c.name == self.concept_name {
                target_concept = c;
                break;
            }
        }
        
        questions = [];
        
        # Generate concept-specific questions
        if self.concept_name == "Jac syntax" {
            questions = [
                {"q": "What keyword is used to declare fields in a node or walker?", "options": ["var", "let", "has", "def"], "answer": "has", "type": "multiple"},
                {"q": "Which of these is a valid node definition?", "options": ["node user { has name: str; }", "class user { name: str }", "def user(name)", "struct user { name }"], "answer": "node user { has name: str; }", "type": "multiple"},
                {"q": "What symbol ends most statements in Jac?", "options": [":", ".", ";", ","], "answer": ";", "type": "multiple"}
            ];
        } elif self.concept_name == "Nodes & edges" {
            questions = [
                {"q": "Which operator creates a generic edge between two nodes?", "options": ["->", "++>", "=>", "-->"], "answer": "++>", "type": "multiple"},
                {"q": "How do you access all nodes connected to a node?", "options": ["node.children", "[node -->]", "node.edges", "get_connected(node)"], "answer": "[node -->]", "type": "multiple"},
                {"q": "What keyword defines a custom edge type?", "options": ["connection", "link", "edge", "relation"], "answer": "edge", "type": "multiple"}
            ];
        } elif self.concept_name == "Walkers" {
            questions = [
                {"q": "What keyword is used to return data from a walker?", "options": ["return", "yield", "report", "output"], "answer": "report", "type": "multiple"},
                {"q": "How do you stop a walker's traversal immediately?", "options": ["stop", "break", "exit", "disengage"], "answer": "disengage", "type": "multiple"},
                {"q": "What does 'visit [-->]' do in a walker?", "options": ["Creates edges", "Moves to connected nodes", "Deletes nodes", "Prints nodes"], "answer": "Moves to connected nodes", "type": "multiple"}
            ];
        } elif self.concept_name == "GraphOps" {
            questions = [
                {"q": "How do you filter nodes by type in Jac?", "options": ["filter(type)", "[-->(`?NodeType)]", "nodes.type()", "get_type()"], "answer": "[-->(`?NodeType)]", "type": "multiple"},
                {"q": "What does '-->' return when used on a node?", "options": ["Edge count", "Node properties", "Connected nodes", "Parent node"], "answer": "Connected nodes", "type": "multiple"},
                {"q": "Which is valid for accessing incoming edges?", "options": ["<--", "-->", "<->", "<<-"], "answer": "<--", "type": "multiple"}
            ];
        } elif self.concept_name == "OSP" {
            questions = [
                {"q": "What does 'here' refer to in a walker ability?", "options": ["The walker itself", "The current node", "The root node", "The parent node"], "answer": "The current node", "type": "multiple"},
                {"q": "What does OSP stand for?", "options": ["Object-Spatial Programming", "Ordered State Protocol", "Open Source Platform", "Object System Pattern"], "answer": "Object-Spatial Programming", "type": "multiple"},
                {"q": "In OSP, where does computation occur?", "options": ["Central server", "At node locations in the graph", "External API", "Database"], "answer": "At node locations in the graph", "type": "multiple"}
            ];
        } elif self.concept_name == "byLLM" {
            questions = [
                {"q": "What decorator enables LLM-powered abilities?", "options": ["@ai", "@llm", "by llm()", "@generate"], "answer": "by llm()", "type": "multiple"},
                {"q": "Which environment variable is needed for byLLM?", "options": ["LLM_KEY", "AI_TOKEN", "OPENAI_API_KEY", "GPT_SECRET"], "answer": "OPENAI_API_KEY", "type": "multiple"},
                {"q": "What does byLLM use to understand what to generate?", "options": ["Magic", "Function signature and docstring", "Random guessing", "External config"], "answer": "Function signature and docstring", "type": "multiple"}
            ];
        } elif self.concept_name == "AI agents" {
            questions = [
                {"q": "What combination creates AI agents in Jac?", "options": ["Nodes + edges", "Walkers + byLLM", "Classes + methods", "Functions + loops"], "answer": "Walkers + byLLM", "type": "multiple"},
                {"q": "What makes walkers good for AI agents?", "options": ["They are fast", "They traverse graphs and make decisions", "They use less memory", "They are simple"], "answer": "They traverse graphs and make decisions", "type": "multiple"},
                {"q": "AI agents can combine which two Jac concepts?", "options": ["OSP + byLLM", "Syntax + edges", "Nodes + walkers", "Variables + loops"], "answer": "OSP + byLLM", "type": "multiple"}
            ];
        } else {
            questions = [
                {"q": "What is the main purpose of " + self.concept_name + "?", "type": "short", "answer": ""},
                {"q": "Describe a use case for " + self.concept_name + ".", "type": "short", "answer": ""}
            ];
        }
        
        q = quiz(
            concept=self.concept_name,
            questions=questions,
            passing_score=70
        );
        here ++> q;
        report {"quiz_id": str(id(q)), "concept": self.concept_name, "questions": questions, "passing_score": 70};
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

        # Naive evaluator
        score = 0;
        total = len(q.questions);
        pct = 0;
        if total > 0 {
            pct = (score * 100) / total;
        }
        report {"score": pct};
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
