"""init_graph.jac - initializes concepts, lessons, and OSP edges"""

import models.concept;
import models.lesson;

walker init_graph {
    can setup with `root entry {
        # Create core concept nodes
        c_walkers = concept(name="Walkers", description="How walkers operate in Jac", difficulty=2, required_score=70, mastery_score=90);
        c_osp = concept(name="OSP", description="Object-Spatial Graph concepts and patterns", difficulty=2, required_score=70, mastery_score=90);
        c_byLLM = concept(name="byLLM", description="Using LLM-backed decorators and agents", difficulty=3, required_score=75, mastery_score=90);
        c_graphops = concept(name="GraphOps", description="Graph operations and traversal", difficulty=2, required_score=70, mastery_score=88);
        c_syntax = concept(name="Jac syntax", description="Jac language basics and syntax", difficulty=1, required_score=65, mastery_score=85);
        c_nodes = concept(name="Nodes & edges", description="Creating and working with nodes & edges", difficulty=1, required_score=65, mastery_score=85);
        c_agents = concept(name="AI agents", description="Designing agents and byLLM usage", difficulty=3, required_score=75, mastery_score=92);

        # Link prerequisites using simple edges
        c_syntax ++> c_nodes;
        c_nodes ++> c_walkers;
        c_walkers ++> c_graphops;
        c_graphops ++> c_osp;
        c_osp ++> c_byLLM;
        c_byLLM ++> c_agents;

        # Create detailed lessons for each concept
        l1 = lesson(
            title="Intro to Jac syntax",
            content="Learn the fundamentals of the Jac programming language, including variables, data types, control flow, and basic syntax patterns.",
            detailed_content="Jac is a data-spatial programming language that combines the familiarity of Python with powerful graph-based computing concepts. In this lesson, you'll learn:\n\n• **Variables**: Use 'let' to declare variables (let x = 5;)\n• **Data Types**: Jac supports int, float, str, bool, list, and dict\n• **Control Flow**: if/elif/else statements and for/while loops\n• **Functions**: Define functions using 'can' keyword\n• **Entry Points**: Use 'with entry { }' to define program entry\n\nJac files use the .jac extension and can be run using 'jac run filename.jac'.",
            examples=[
                {"title": "Hello World", "code": "with entry {\n    print(\"Hello, Jac!\");\n}"},
                {"title": "Variables and Math", "code": "with entry {\n    let a = 10;\n    let b = 20;\n    let sum = a + b;\n    print(\"Sum:\", sum);\n}"},
                {"title": "Conditionals", "code": "with entry {\n    let score = 85;\n    if score >= 90 {\n        print(\"Grade: A\");\n    } elif score >= 80 {\n        print(\"Grade: B\");\n    } else {\n        print(\"Grade: C\");\n    }\n}"},
                {"title": "For Loop", "code": "with entry {\n    for i in range(5) {\n        print(\"Count:\", i);\n    }\n}"}
            ],
            concepts=[c_syntax],
            difficulty=1,
            unlocked=True
        );

        l2 = lesson(
            title="Nodes & Edges",
            content="Understand the core building blocks of Jac's graph-based data model: nodes for storing data and edges for connecting them.",
            detailed_content="In Jac, data is organized as a graph structure consisting of nodes and edges. This is fundamentally different from traditional programming where data lives in isolated variables.\n\n**Nodes** are vertices that hold data:\n• Define node types with 'node NodeName { has field: type; }'\n• Create instances with NodeName(field=value)\n• Access properties with dot notation: node.field\n\n**Edges** are connections between nodes:\n• Use '++>' to create an edge: nodeA ++> nodeB\n• Use '-->' to traverse edges\n• Edges can also have data attached to them\n\n**The Root**: Every Jac program has a special 'root' node that serves as the entry point to your graph.",
            examples=[
                {"title": "Define a Node Type", "code": "node Person {\n    has name: str;\n    has age: int;\n}\n\nwith entry {\n    let p = Person(name=\"Alice\", age=30);\n    print(p.name, \"is\", p.age, \"years old\");\n}"},
                {"title": "Connect Nodes with Edges", "code": "node City {\n    has name: str;\n}\n\nwith entry {\n    let paris = City(name=\"Paris\");\n    let london = City(name=\"London\");\n    \n    # Connect cities with an edge\n    paris ++> london;\n    \n    print(\"Connected Paris to London!\");\n}"},
                {"title": "Build a Graph from Root", "code": "node Task {\n    has title: str;\n    has done: bool = false;\n}\n\nwith entry {\n    # Add tasks to the root node\n    root ++> Task(title=\"Learn Jac\");\n    root ++> Task(title=\"Build an app\");\n    root ++> Task(title=\"Deploy\");\n    \n    print(\"Added 3 tasks to the graph!\");\n}"},
                {"title": "Typed Edges", "code": "node Person {\n    has name: str;\n}\n\nedge knows {\n    has since: int;\n}\n\nwith entry {\n    let alice = Person(name=\"Alice\");\n    let bob = Person(name=\"Bob\");\n    \n    # Connect with a typed edge\n    alice +:knows(since=2020):+> bob;\n    \n    print(alice.name, \"knows\", bob.name);\n}"}
            ],
            concepts=[c_nodes],
            difficulty=1,
            unlocked=False
        );

        l3 = lesson(
            title="Walkers Deep-Dive",
            content="Master walkers - the mobile agents that traverse your graph, performing actions at each node they visit.",
            detailed_content="Walkers are Jac's unique way of processing data. Instead of calling functions on data, walkers 'walk' through your graph and execute code at each node they visit.\n\n**Key Walker Concepts:**\n• **Definition**: 'walker WalkerName { has field: type; can ability { } }'\n• **Spawning**: Create and run a walker with 'spawn WalkerName()'\n• **Traversal**: Use 'visit' to move to connected nodes\n• **Entry/Exit**: 'with NodeType entry { }' runs when entering a node\n\n**Walker Abilities:**\n• 'can' defines what a walker can do\n• 'with entry' triggers when entering any node\n• 'with NodeType entry' triggers only at specific node types\n• 'visit [-->]' moves to all connected nodes\n\n**Data Flow:**\n• 'here' refers to the current node\n• 'report' sends data back from the walker\n• Walkers maintain state as they traverse",
            examples=[
                {"title": "Simple Walker", "code": "node Greeting {\n    has message: str;\n}\n\nwalker Greeter {\n    can greet with Greeting entry {\n        print(here.message);\n    }\n}\n\nwith entry {\n    root ++> Greeting(message=\"Hello!\");\n    root ++> Greeting(message=\"Welcome!\");\n    \n    root spawn Greeter();\n}"},
                {"title": "Walker with State", "code": "node Number {\n    has value: int;\n}\n\nwalker Summer {\n    has total: int = 0;\n    \n    can add with Number entry {\n        self.total += here.value;\n    }\n    \n    can report_total with `root exit {\n        print(\"Total:\", self.total);\n    }\n}\n\nwith entry {\n    root ++> Number(value=10);\n    root ++> Number(value=20);\n    root ++> Number(value=30);\n    \n    root spawn Summer();\n}"},
                {"title": "Graph Traversal", "code": "node Room {\n    has name: str;\n}\n\nwalker Explorer {\n    can explore with Room entry {\n        print(\"Visiting:\", here.name);\n        visit [-->];  # Visit all connected rooms\n    }\n}\n\nwith entry {\n    let hall = Room(name=\"Hall\");\n    let kitchen = Room(name=\"Kitchen\");\n    let bedroom = Room(name=\"Bedroom\");\n    \n    root ++> hall;\n    hall ++> kitchen;\n    hall ++> bedroom;\n    \n    root spawn Explorer();\n}"},
                {"title": "Walker with Report", "code": "node Product {\n    has name: str;\n    has price: float;\n}\n\nwalker PriceFinder {\n    has max_price: float = 0.0;\n    has max_name: str = \"\";\n    \n    can check with Product entry {\n        if here.price > self.max_price {\n            self.max_price = here.price;\n            self.max_name = here.name;\n        }\n    }\n    \n    can result with `root exit {\n        report {\"most_expensive\": self.max_name, \"price\": self.max_price};\n    }\n}\n\nwith entry {\n    root ++> Product(name=\"Laptop\", price=999.99);\n    root ++> Product(name=\"Phone\", price=699.99);\n    root ++> Product(name=\"Tablet\", price=449.99);\n    \n    root spawn PriceFinder();\n}"}
            ],
            concepts=[c_walkers],
            difficulty=2,
            unlocked=False
        );

        l4 = lesson(
            title="GraphOps & OSP Patterns",
            content="Learn advanced graph operations and Object-Spatial Programming patterns for building sophisticated applications.",
            detailed_content="Object-Spatial Programming (OSP) is Jac's paradigm where data lives in a spatial graph and computation happens through walker traversal.\n\n**Graph Operations:**\n• '-->' : Traverse outgoing edges\n• '<--' : Traverse incoming edges\n• '<-->' : Traverse both directions\n• '[-->]' : Get list of connected nodes\n• '[--> NodeType]' : Filter by node type\n\n**Filtering & Querying:**\n• Filter nodes: '[-->(`?NodeType)]'\n• Conditional: '[-->](?x > 10)'\n• Named edges: '[-:edgetype:->]'\n\n**OSP Principles:**\n• Data has location (exists in the graph)\n• Computation moves to data (walkers visit nodes)\n• Relationships are first-class (edges are explicit)\n• State is distributed (each node holds its own data)",
            examples=[
                {"title": "Filter by Node Type", "code": "node Employee { has name: str; }\nnode Manager { has name: str; has dept: str; }\n\nwalker FindManagers {\n    can find with `root entry {\n        for m in [--> `Manager] {\n            print(\"Manager:\", m.name, \"Dept:\", m.dept);\n        }\n    }\n}\n\nwith entry {\n    root ++> Employee(name=\"Alice\");\n    root ++> Manager(name=\"Bob\", dept=\"Engineering\");\n    root ++> Employee(name=\"Charlie\");\n    root ++> Manager(name=\"Diana\", dept=\"Sales\");\n    \n    root spawn FindManagers();\n}"},
                {"title": "Bidirectional Traversal", "code": "node Station {\n    has name: str;\n}\n\nwalker TrainRoute {\n    can check with Station entry {\n        print(\"At:\", here.name);\n        print(\"  Connected to:\", [n.name for n in [<-->]]);\n    }\n}\n\nwith entry {\n    let a = Station(name=\"Central\");\n    let b = Station(name=\"North\");\n    let c = Station(name=\"South\");\n    \n    root ++> a;\n    a ++> b;\n    a ++> c;\n    b ++> c;  # Creates a triangle\n    \n    root spawn TrainRoute();\n}"},
                {"title": "Graph Query", "code": "node Item {\n    has name: str;\n    has price: int;\n}\n\nwith entry {\n    root ++> Item(name=\"Apple\", price=2);\n    root ++> Item(name=\"Laptop\", price=1000);\n    root ++> Item(name=\"Book\", price=15);\n    root ++> Item(name=\"Car\", price=20000);\n    \n    # Find expensive items (price > 100)\n    let expensive = [i for i in [--> `Item] if i.price > 100];\n    \n    for item in expensive {\n        print(item.name, \"-\", item.price);\n    }\n}"}
            ],
            concepts=[c_graphops, c_osp],
            difficulty=2,
            unlocked=False
        );

        l5 = lesson(
            title="byLLM & AI Agents",
            content="Harness the power of Large Language Models with Jac's byLLM decorator to create intelligent, AI-powered applications.",
            detailed_content="Jac integrates seamlessly with Large Language Models through the 'by llm' feature, allowing you to create AI-powered functionality with minimal code.\n\n**byLLM Basics:**\n• Add 'by llm' to a function to make it AI-powered\n• The function signature becomes a prompt\n• Return type guides the LLM's output format\n• Works with OpenAI, Anthropic, and other providers\n\n**AI Agent Patterns:**\n• Define agent behavior with 'can' abilities\n• Use 'by llm' for decision-making\n• Combine with graph traversal for complex agents\n• Chain multiple LLM calls for multi-step reasoning\n\n**Best Practices:**\n• Provide clear type hints for structured output\n• Use docstrings to guide LLM behavior\n• Handle errors gracefully\n• Cache results when appropriate",
            examples=[
                {"title": "Simple LLM Function", "code": "import from jac_cloud.core.llm { with_llm }\n\ncan summarize(text: str) -> str by llm(\n    prompt=\"Summarize the following text in one sentence:\"\n);\n\nwith entry {\n    let result = summarize(\"Jac is a programming language...\");\n    print(result);\n}"},
                {"title": "Structured Output", "code": "obj Sentiment {\n    has score: float;  # -1 to 1\n    has label: str;    # positive/negative/neutral\n}\n\ncan analyze_sentiment(text: str) -> Sentiment by llm();\n\nwith entry {\n    let s = analyze_sentiment(\"I love this product!\");\n    print(\"Score:\", s.score);\n    print(\"Label:\", s.label);\n}"},
                {"title": "AI Decision Walker", "code": "node Question {\n    has text: str;\n    has answer: str = \"\";\n}\n\nwalker AIHelper {\n    can answer with Question entry {\n        # In real app, this would use 'by llm'\n        here.answer = \"AI would answer: \" + here.text;\n        print(\"Q:\", here.text);\n        print(\"A:\", here.answer);\n    }\n}\n\nwith entry {\n    root ++> Question(text=\"What is Jac?\");\n    root ++> Question(text=\"How do walkers work?\");\n    \n    root spawn AIHelper();\n}"}
            ],
            concepts=[c_byLLM, c_agents],
            difficulty=3,
            unlocked=False
        );

        # Associate lessons with concepts
        c_syntax.lessons.append(l1);
        c_nodes.lessons.append(l2);
        c_walkers.lessons.append(l3);
        c_graphops.lessons.append(l4);
        c_osp.lessons.append(l4);
        c_byLLM.lessons.append(l5);
        c_agents.lessons.append(l5);

        return {"status": "initialized", "concepts": [c_syntax.name, c_nodes.name, c_walkers.name]};
    }
}
