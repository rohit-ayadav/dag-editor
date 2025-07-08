# 🧩 DAG Editor with React Flow

A simple and interactive Directed Acyclic Graph (DAG) editor built using [React Flow](https://reactflow.dev/), allowing users to create, connect, and visualize workflows or data pipelines.


---

## 🚀 Features

- ✅ Add custom nodes dynamically
- ✅ Connect nodes with edges
- ✅ Auto-layout support (Top-Bottom or Left-Right)
- ✅ Validate whether the graph is a valid DAG
- ✅ Undo/Redo functionality
- ✅ Live JSON preview of the current DAG structure
- ✅ Responsive and modern UI layout

---

## 📦 Technologies Used

- [React](https://reactjs.org/)
- [React Flow](https://reactflow.dev/)
- [Dagre](https://github.com/dagrejs/dagre) – For automatic graph layout
- TypeScript

---


## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/rohit-ayadav/dag-editor.git
cd dag-editor
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the app

```bash
npm start
# or
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the DAG editor.

---

## 🧩 Core Features Explained

| Feature | Description |
|--------|-------------|
| **Add Node** | Dynamically add new nodes by clicking the "Add Node" button or pressing `Ctrl/Cmd + N` |
| **Connect Nodes** | Drag from one node to another to create an edge |
| **Auto Layout** | Use the "Auto Layout" button to arrange all nodes automatically using Dagre |
| **Validate DAG** | Automatically checks if the graph contains cycles |
| **Undo/Redo** | Use `Ctrl/Cmd + Z` to undo and `Ctrl/Cmd + Shift + Z` to redo actions |
| **Live JSON Preview** | Toggle JSON panel to see real-time representation of the graph |
| **Delete Selection** | Select nodes or edges and press `Backspace` or `Delete` to remove them |

---

## 📁 Project Structure

```
src/
├── component/
│   └── CustomNode.tsx       # Custom node component
├── utils/
│   ├── validateDAG.ts        # Validates that the graph is a DAG
│   └── applyAutoLayout.ts    # Applies layout using Dagre
├── App.tsx                   # Main application logic
└── index.tsx                 # Entry point
```

---

## 📜 Scripts

| Script | Description |
|-------|-------------|
| `npm start` | Runs the development server |
| `npm run build` | Builds the production version |
| `npm test` | Runs tests (if applicable) |
| `npm run lint` | Lints code (if ESLint/Prettier is configured) |

---

## 📬 Contact

If you have any questions or feedback, feel free to reach out:

👤 **Rohit Yadav**  
📧 Email: rohitkuyada@gmail.com
🐦 Twitter: [@rohitayadav](https://twitter.com/rohitayadav)  
🐙 GitHub: [https://github.com/rohit-ayadav](https://github.com/rohit-ayadav)

---

## 🌟 Acknowledgments

- Thanks to [React Flow](https://reactflow.dev/) for providing such a powerful visualization library.
- Inspired by workflow editors like Airflow, Prefect, and AWS Step Functions.
