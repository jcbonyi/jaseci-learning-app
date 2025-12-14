# Jac Tutor Application - All-in-One
# Combines backend walkers and frontend client code in a single file
# Run with: jac serve app.jac

# ============ byLLM AI Features ============
# Requires: GEMINI_API_KEY environment variable

import from byllm.lib { Model }

glob llm = Model(model_name="gemini/gemini-2.0-flash");

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

# ============ BACKEND WALKERS ============

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
                detailed_content="The by llm() decorator in Jac enables AI-powered code generation at runtime. Decorate abilities with by llm() to have an LLM implement the logic based on the function signature, docstring, and context. This is powerful for tasks like text generation, classification, summarization, and creative content. Requires GEMINI_API_KEY environment variable.",
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
    has use_ai: bool = True;

    can generate with `root entry {
        print("📝 Generating quiz for:", self.concept_name, "| AI mode:", self.use_ai);
        
        questions = [];
        
        if self.use_ai {
            # Find the concept to get its details for better context
            target_concept = None;
            for c in [-->(`?concept)] {
                if c.name == self.concept_name {
                    target_concept = c;
                    break;
                }
            }
            
            # Build a comprehensive topic description with concept details and examples
            topic_description = self.concept_name;
            if target_concept {
                # Include description and key details
                topic_description = self.concept_name + " in Jac programming: " + target_concept.description + ". " + target_concept.detailed_content;
                
                # Add code examples context for better question generation
                if len(target_concept.examples) > 0 {
                    example_code = "";
                    first_example = target_concept.examples[0];
                    if "code" in first_example {
                        example_code = first_example["code"];
                    }
                    if example_code {
                        topic_description = topic_description + " Example Jac code: " + example_code;
                    }
                }
            }
            
            # Use AI to generate questions dynamically with enhanced context
            ai_questions = generate_quiz_questions(topic_description, 5);
            for q in ai_questions {
                questions.append({
                    "q": q.q,
                    "type": "multiple",
                    "options": q.options,
                    "answer": q.answer
                });
            }
        } else {
            # Fallback static questions
            questions = [
                {"q": "What is " + self.concept_name + " in Jac?", "options": ["A concept", "A feature", "A pattern", "All of the above"], "answer": "All of the above", "type": "multiple"}
            ];
        }
        
        q = quiz(
            concept=self.concept_name,
            questions=questions,
            passing_score=70
        );
        here ++> q;
        report {"quiz_id": str(id(q)), "concept": self.concept_name, "questions": questions, "passing_score": 70, "generated_by": "AI" if self.use_ai else "static"};
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

# Define typed objects for structured LLM responses
obj QuizQuestion {
    has q: str;
    has options: list[str];
    has answer: str;
}

obj LessonContent {
    has title: str;
    has overview: str;
    has detailed_content: str;
    has key_points: list[str];
    has example_titles: list[str];
    has example_codes: list[str];
}

obj ConceptContent {
    has overview: str;
    has explanation: str;
    has example_titles: list[str];
    has example_codes: list[str];
}

# AI-powered functions with typed returns
def generate_quiz_questions(topic: str, count: int) -> list[QuizQuestion] by llm();
"""Generate {count} multiple choice quiz questions specifically about the Jac programming language concept: {topic}.

CRITICAL REQUIREMENTS - READ CAREFULLY:
- Questions MUST be about Jac programming language ONLY - NOT Python, JavaScript, Java, C++, or any other language
- Questions MUST test understanding of the specific concept: {topic} in the context of Jac programming
- Questions should test practical knowledge of Jac syntax, keywords, and unique features
- Each question should have exactly 4 answer choices
- The correct answer must exactly match one of the 4 options

JAC PROGRAMMING LANGUAGE CONTEXT:
Jac is a graph-based programming language with these unique features:
- Uses keywords: node, walker, edge, has, can, spawn, visit, report, disengage
- Graph-based: nodes hold data, edges connect nodes, walkers traverse graphs
- Syntax: uses curly braces {{}}, semicolons for statements, --> for graph traversal
- Special keywords: 'here' refers to current node, 'self' refers to walker
- Walkers are mobile agents that traverse graphs, not functions or methods
- Nodes are defined with 'node NodeName {{ has field: type; }}'
- Walkers are defined with 'walker WalkerName {{ has param: type; can method with NodeType entry {{ }} }}'
- Spawn walkers with: 'spawn walker_name with node entry'
- Use 'visit [-->]' to traverse edges, 'report' to return data, 'disengage' to stop

CONCEPT-SPECIFIC GUIDELINES FOR "{topic}":

If topic is "Walkers" or contains "Walker":
- Walkers in Jac are mobile agents that traverse graphs, NOT functions or methods
- Test understanding of walker definition syntax: 'walker name {{ has param: type; can method with node entry {{ }} }}'
- Test walker spawning: 'spawn walker_name with node entry' (NOT function calls like walker_name())
- Test walker traversal: 'visit [-->]' to move to connected nodes, 'visit [-->(`?NodeType)]' to filter by type
- Test walker keywords: 'report' (returns data), 'disengage' (stops traversal), 'here' (current node), 'self' (walker instance)
- Test walker abilities: 'can method_name with NodeType entry {{ }}' (NOT class methods)
- Example good question: "What keyword is used to stop a walker's traversal in Jac?" 
  Options: ["stop", "disengage", "exit", "return"]
  Answer: "disengage"
- Example good question: "How do you spawn a walker named 'finder' on a user node in Jac?" 
  Options: ["finder(user)", "spawn finder with user entry", "finder.spawn(user)", "call finder(user)"]
  Answer: "spawn finder with user entry"
- Example good question: "What does 'visit [-->]' do in a Jac walker?"
  Options: ["Calls a function", "Visits all connected nodes", "Returns a value", "Defines a variable"]
  Answer: "Visits all connected nodes"
- Example good question: "In Jac, what keyword refers to the current node a walker is on?"
  Options: ["this", "here", "current", "node"]
  Answer: "here"
- DO NOT ask about functions, methods, classes, object-oriented programming, or concepts from other languages
- DO NOT use function call syntax - walkers are spawned, not called
- Focus on Jac-specific walker syntax: spawn, visit, report, disengage, here, self

If topic is "Nodes & edges" or contains "Node" or "Edge":
- Test node definition: 'node NodeName {{ has field: type; }}'
- Test edge creation: 'node1 ++> node2' (generic), 'node1 +:edge_type:+> node2' (typed)
- Test graph traversal: '[node -->]' to get connected nodes
- Test edge filtering: '[node -->(`?NodeType)]' to filter by type
- Example good question: "What operator creates a generic edge between two nodes in Jac?" Answer: "++>"
- DO NOT ask about classes, objects, or data structures from other languages

If topic is "Jac syntax":
- Test Jac-specific syntax: curly braces, semicolons, 'has' keyword
- Test variable declaration: 'has name: str = value;'
- Test control flow: 'if condition {{ }} else {{ }}'
- DO NOT ask about Python indentation, JavaScript var/let/const, or other language syntax

If topic is "GraphOps":
- Test graph query syntax: '[-->(`?NodeType)]', '[node -->]'
- Test edge type filtering: '[node -->:edge_type:-->]'
- Test graph traversal patterns
- DO NOT ask about SQL queries, database operations, or other query languages

If topic is "OSP" or "Object-Spatial":
- Test 'here' keyword (current node context)
- Test 'self' keyword (walker context)
- Test spatial programming concepts unique to Jac
- DO NOT ask about object-oriented programming from other languages

If topic is "byLLM":
- Test 'by llm()' decorator syntax
- Test LLM integration in Jac
- DO NOT ask about decorators in Python or other languages

If topic is "AI agents":
- Test combining walkers with LLM capabilities in Jac
- Test agent patterns specific to Jac
- DO NOT ask about AI agents in Python, JavaScript, or other frameworks

EXAMPLE GOOD QUESTIONS FOR "Walkers":
Q1: "What keyword stops a walker's traversal in Jac?"
Options: ["stop", "disengage", "exit", "return"]
Answer: "disengage"

Q2: "How do you define a walker with a parameter in Jac?"
Options: ["walker name(param)", "walker name {{ has param: type; }}", "function name(param)", "def name(param)"]
Answer: "walker name {{ has param: type; }}"

Q3: "What does 'visit [-->]' do in a Jac walker?"
Options: ["Visits all connected nodes", "Returns a value", "Stops execution", "Defines a function"]
Answer: "Visits all connected nodes"

STRICT PROHIBITIONS:
- DO NOT create generic programming questions
- DO NOT ask about Python, JavaScript, Java, C++, or any other language
- DO NOT use syntax from other languages (no def, class, function keywords unless testing Jac equivalents)
- DO NOT ask about concepts that don't exist in Jac (no classes, no inheritance, no traditional OOP)
- Focus ONLY on Jac programming language syntax, keywords, and graph-based concepts
- Test understanding of how {topic} works specifically in Jac with Jac syntax
- Make questions educational and test practical understanding of Jac programming"""

def generate_full_lesson(topic: str, level: str) -> LessonContent by llm();
"""Generate a complete lesson about {topic} for {level} students.

Return a LessonContent object with these EXACT fields:

1. title: Short lesson title (plain text, no markdown)

2. overview: 1-2 sentence summary of what will be learned (plain text, NO code)

3. detailed_content: 2-3 paragraphs explaining the topic in depth (plain text, NO code, NO markdown)

4. key_points: List of 3-5 short takeaway bullet points (plain text strings)

5. example_titles: List of 2 short titles for code examples
   Example: ["Simple Node", "Node with Methods"]

6. example_codes: List of 2 Jac code snippets (valid code with comments, NO markdown)
   Example:
   node Counter {
       has count: int = 0;
   }
"""

def generate_full_concept(name: str, level: str) -> ConceptContent by llm();
"""Generate educational content about the Jac programming concept: {name} for {level} level.

Return a ConceptContent object with these EXACT fields:

1. overview: A brief 2-3 sentence introduction. Plain text only, NO code.
   Example: "Walkers are mobile units that traverse the graph. They can visit nodes and execute code at each location."

2. explanation: A detailed 3-4 paragraph explanation. Plain text only, NO code, NO markdown.
   Explain what it is, why it matters, and how to use it conceptually.

3. example_titles: A list of 2 short titles for code examples.
   Example: ["Basic Walker", "Walker with Parameters"]

4. example_codes: A list of 2 Jac code snippets (matching the titles).
   Each should be valid Jac code with comments. NO markdown fences.
   Example code:
   walker greet {
       can say_hi with entry {
           print("Hello!");
       }
   }
"""

# Dynamic Lesson Content Walker (AI-powered)
walker get_lesson_dynamic {
    has lesson_title: str;
    has use_ai: bool = True;

    can get with `root entry {
        print("📚 Getting dynamic lesson:", self.lesson_title, "| AI mode:", self.use_ai);
        
        # Find the lesson
        target_lesson = None;
        for l in [-->(`?lesson)] {
            if l.title == self.lesson_title {
                target_lesson = l;
                break;
            }
        }
        
        if target_lesson is None {
            report {"error": "lesson_not_found"};
            disengage;
        }
        
        if self.use_ai {
            # Generate content dynamically with AI - single call for all content
            levels = ["beginner", "intermediate", "advanced"];
            level = levels[target_lesson.difficulty - 1] if target_lesson.difficulty <= 3 else "beginner";
            
            # Single AI call to get all lesson content
            content = generate_full_lesson(target_lesson.title, level);
            
            # Build examples from parallel lists
            formatted_examples = [];
            num_examples = len(content.example_titles);
            for i in range(num_examples) {
                formatted_examples.append({
                    "title": content.example_titles[i],
                    "code": content.example_codes[i] if i < len(content.example_codes) else ""
                });
            }
            
            report {
                "title": target_lesson.title,
                "concept": target_lesson.concept,
                "overview": content.overview,
                "detailed_content": content.detailed_content,
                "key_points": content.key_points,
                "examples": formatted_examples,
                "difficulty": target_lesson.difficulty,
                "order": target_lesson.order,
                "generated_by": "AI"
            };
        } else {
            # Return static content from the lesson node
            report {
                "title": target_lesson.title,
                "concept": target_lesson.concept,
                "overview": target_lesson.content,
                "detailed_content": target_lesson.detailed_content,
                "key_points": [],
                "examples": target_lesson.examples,
                "difficulty": target_lesson.difficulty,
                "order": target_lesson.order,
                "generated_by": "static"
            };
        }
    }
}

# Dynamic Concept Content Walker (AI-powered)
walker get_concept_dynamic {
    has concept_name: str;
    has use_ai: bool = True;

    can get with `root entry {
        print("🧠 Getting dynamic concept:", self.concept_name, "| AI mode:", self.use_ai);
        
        # Find the concept
        target_concept = None;
        for c in [-->(`?concept)] {
            if c.name == self.concept_name {
                target_concept = c;
                break;
            }
        }
        
        if target_concept is None {
            report {"error": "concept_not_found"};
            disengage;
        }
        
        if self.use_ai {
            # Generate content dynamically with AI - single call for all content
            levels = ["beginner", "intermediate", "advanced"];
            level = levels[target_concept.difficulty - 1] if target_concept.difficulty <= 3 else "beginner";
            
            # Single AI call to get all content in correct structure
            content = generate_full_concept(target_concept.name, level);
            
            # Build examples from parallel lists
            formatted_examples = [];
            num_examples = len(content.example_titles);
            for i in range(num_examples) {
                formatted_examples.append({
                    "title": content.example_titles[i],
                    "code": content.example_codes[i] if i < len(content.example_codes) else ""
                });
            }
            
            report {
                "name": target_concept.name,
                "description": content.overview,
                "detailed_content": content.explanation,
                "examples": formatted_examples,
                "difficulty": target_concept.difficulty,
                "order": target_concept.order,
                "required_score": target_concept.required_score,
                "mastery_score": target_concept.mastery_score,
                "generated_by": "AI"
            };
        } else {
            # Return static content from the concept node
            report {
                "name": target_concept.name,
                "description": target_concept.description,
                "detailed_content": target_concept.detailed_content,
                "examples": target_concept.examples,
                "difficulty": target_concept.difficulty,
                "order": target_concept.order,
                "required_score": target_concept.required_score,
                "mastery_score": target_concept.mastery_score,
                "generated_by": "static"
            };
        }
    }
}

# ============ FRONTEND CLIENT CODE ============

cl import from "react" {useState, useEffect, createContext, useContext}
cl import from "react-dom/client" {createRoot}

# Import styles from src folder
cl import "./src/styles.css";

# Import API module from src folder
cl import from "./src/api.js" {
    createUser,
    getNextLesson,
    healthCheck,
    getDashboard,
    recommendNext,
    updateMastery,
    generateQuiz,
    saveNote,
    getNotes,
    getConceptDynamic,
    recordLessonProgress
}

# Import React components from src/components folder
cl import from "./src/components/ThemeProvider.jsx" {
    default as ThemeProvider,
    useTheme,
    ThemeToggle
}
cl import from "./src/components/CodeContext.jsx" {
    default as CodeProvider
}
cl import from "./src/components/Dashboard.jsx" {
    default as Dashboard
}
cl import from "./src/components/LessonPage.jsx" {
    default as LessonPage
}
cl import from "./src/components/QuizPage.jsx" {
    default as QuizPage
}
cl import from "./src/components/CodeEditor.jsx" {
    default as CodeEditor
}
cl import from "./src/components/Skeleton.jsx" {
    DashboardSkeleton,
    LessonSkeleton
}

cl {
    # Main App component - wraps everything with providers
    # JAC client runtime looks for 'app' (lowercase) as the entry point
    def app() -> any {
        # Disable service worker in development
        useEffect(lambda -> None {
            if 'serviceWorker' in navigator {
                navigator.serviceWorker.getRegistrations().then(lambda registrations: any -> None {
                    for reg in registrations {
                        console.log('Unregistering old service worker:', reg.scope);
                        reg.unregister();
                    }
                });
            }
        }, []);
        
        return <ThemeProvider>
            <CodeProvider>
                <AppContent />
            </CodeProvider>
        </ThemeProvider>;
    }

    # Main App Content with all functionality
    def AppContent() -> any {
        let { isDark } = useTheme();
        let [user, setUser] = useState("demo_user");
        let [lesson, setLesson] = useState(null);
        let [quiz, setQuiz] = useState(null);
        let [loading, setLoading] = useState(true);
        let [error, setError] = useState(null);
        let [apiOnline, setApiOnline] = useState(false);
        let [refreshKey, setRefreshKey] = useState(0);

        # Fetch next lesson function
        async def fetchNextLesson() -> None {
            let next = await getNextLesson(user);
            console.log("Next lesson:", next);
            
            if next and next.next_lesson {
                setLesson(next.next_lesson);
            } elif next and next.recommended_review {
                console.log("Recommended review:", next.recommended_review);
                setLesson(null);
            } else {
                setLesson(null);
            }
        }

        # Handle lesson completion
        async def handleLessonComplete(completedLesson: any) -> None {
            console.log("Lesson completed:", completedLesson.title);
            setRefreshKey(lambda prev: any -> any { prev + 1; });
            await fetchNextLesson();
        }

        # Initialize app on mount
        useEffect(lambda -> None {
            async def boot() -> None {
                setLoading(true);
                setError(null);
                
                # Check API health first
                let isOnline = await healthCheck().catch(lambda err: any -> any {
                    console.error("Health check error:", err);
                    return false;
                });
                setApiOnline(isOnline);
                
                if not isOnline {
                    setError("Backend API is not available. Please ensure the server is running.");
                    setLoading(false);
                    return;
                }

                # Create or get user
                let userResult = await createUser(user).catch(lambda err: any -> any {
                    console.error("Create user error:", err);
                    return {error: err.message};
                });
                console.log("User created/exists:", userResult);
                
                if userResult.error {
                    console.error("Failed to create user:", userResult.error);
                }
                
                # Get next lesson recommendation
                await fetchNextLesson().catch(lambda err: any -> None {
                    console.error("Boot error:", err);
                    setError(err.message);
                });
                setLoading(false);
            }
            boot();
        }, [user]);

        # Loading state
        if loading {
            return <div className="min-h-screen bg-gray-900">
                <header className="bg-gray-800 shadow-lg p-4 border-b border-gray-700">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-bold text-white">Interactive Jac Tutor</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400">
                                ◌ Connecting...
                            </span>
                        </div>
                    </div>
                </header>
                <main className="max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-4">
                    <DashboardSkeleton />
                    <LessonSkeleton />
                </main>
            </div>;
        }

        # Error state
        if error {
            return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-6 rounded-lg max-w-lg border border-red-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚠️</span>
                        <h2 className="text-xl font-bold text-red-400">Connection Error</h2>
                    </div>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button 
                        onClick={lambda -> None { window.location.reload(); }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
                    >
                        🔄 Retry Connection
                    </button>
                </div>
            </div>;
        }

        # Default code for editor
        let editorDefaultValue = "let a = 5;\nlet b = 7;\nlet sum = a + b;\nprint(\"Sum =\", sum);";

        # Main app UI
        let bgClass = "min-h-screen transition-colors duration-300 ";
        if isDark {
            bgClass = bgClass + "bg-gray-900";
        } else {
            bgClass = bgClass + "bg-gray-100";
        }
        
        let headerClass = "shadow-lg p-3 sm:p-4 border-b transition-colors duration-300 ";
        if isDark {
            headerClass = headerClass + "bg-gray-800 border-gray-700";
        } else {
            headerClass = headerClass + "bg-white border-gray-200";
        }
        
        let titleClass = "text-lg sm:text-xl font-bold ";
        if isDark {
            titleClass = titleClass + "text-white";
        } else {
            titleClass = titleClass + "text-gray-900";
        }
        
        let statusClass = "text-xs px-2 py-1 rounded ";
        if apiOnline {
            statusClass = statusClass + "bg-green-900 text-green-300";
        } else {
            statusClass = statusClass + "bg-red-900 text-red-300";
        }
        
        let userClass = "text-xs sm:text-sm ";
        if isDark {
            userClass = userClass + "text-gray-400";
        } else {
            userClass = userClass + "text-gray-600";
        }
        
        return <div className={bgClass}>
            <header className={headerClass}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                    <h1 className={titleClass}>
                        🚀 Interactive Jac Tutor
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                        <ThemeToggle />
                        <span className={statusClass}>
                            {apiOnline and '● Online' or '○ Offline'}
                        </span>
                        <span className={userClass}>
                            👤 {user}
                        </span>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:y-6 px-3 sm:px-4">
                <Dashboard userId={user} refreshKey={refreshKey} />
                {lesson and <LessonPage userId={user} lesson={lesson} onComplete={handleLessonComplete} />}
                {quiz and <QuizPage quiz={quiz} userId={user} />}
                <section id="code-playground" className="p-5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 scroll-mt-4">
                    <h3 className="font-semibold mb-4 text-white text-lg">🔧 Code Playground</h3>
                    <CodeEditor 
                        value={editorDefaultValue}
                        language="javascript" 
                        onChange={lambda v: any -> None { console.log("code changed", v); }} 
                    />
                </section>
            </main>
        </div>;
    }
}
