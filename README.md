<div align="right">

[English](README.md) | [中文](README_ZH.md)

</div>

# TAF-DataDev - Enterprise SQL Development Editor

<div align="center">

![TAF-DataDev](pic/功能截图.png)

**A Modern SQL Development Environment Built for Data Engineers**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/next.js-16.1-black)](https://nextjs.org/)

</div>

## 📖 Project Overview

TAF-DataDev is an enterprise-grade development environment specifically designed for SQL development. It integrates core functionalities including database connection management, SQL editing, query execution, table structure viewing, and metrics management. Unlike general-purpose code editors (such as Cursor, VS Code), TAF-DataDev focuses on data development scenarios, providing out-of-the-box database operation capabilities and intelligent SQL development experience.

## ✨ Core Features

### 🎯 SQL Development Optimized

- **Intelligent SQL Editor**: Based on CodeMirror 6, providing syntax highlighting, auto-completion, and code formatting
- **Multi-Database Support**: Supports MySQL, PostgreSQL, SQLite, and more
- **Real-time Query Execution**: Execute SQL with one click and view results instantly
- **Table Structure Viewing**: Visually view database table structures, including fields, types, constraints, and more
- **Temporary Table Creation**: Quickly create temporary tables from Excel, JSON, CSV files

### 🚀 Enterprise Features

- **Project Management System**: Supports directory structure management, project requirement entry and tracking
- **Metrics Library Management**: Centralized management of business metrics with classification and search support
- **Case Search**: Quickly search historical SQL cases and solutions
- **AI Intelligent Assistant**:
  - **AI Solution Generation**: Automatically generate SQL solutions based on requirements
  - **AI Metric Extraction**: Intelligently extract business metrics from SQL statements

### 🎨 Modern UI

- **Adjustable Panel Layout**: Support drag-and-drop panel resizing with flexible workspace configuration
- **Dark Theme**: Eye-friendly dark theme, suitable for long-term development
- **Responsive Design**: Adapts to different screen sizes

## 🆚 Comparison with Mainstream Editors

| Feature | TAF-DataDev | Cursor | VS Code | DataGrip |
|---------|-------------|--------|---------|----------|
| **SQL-Specific Optimization** | ✅ Designed for SQL | ❌ General editor | ❌ General editor | ✅ Database IDE |
| **Database Connection Management** | ✅ Built-in | ❌ Requires plugin | ❌ Requires plugin | ✅ Built-in |
| **Table Structure Visualization** | ✅ One-click view | ❌ Requires plugin | ❌ Requires plugin | ✅ Supported |
| **Temporary Table Creation** | ✅ File upload | ❌ Not supported | ❌ Not supported | ❌ Not supported |
| **Metrics Library Management** | ✅ Built-in feature | ❌ Not supported | ❌ Not supported | ❌ Not supported |
| **AI SQL Generation** | ✅ Built-in AI | ✅ AI assistance | ❌ Requires plugin | ❌ Requires plugin |
| **Project Requirement Management** | ✅ Built-in | ❌ Not supported | ❌ Not supported | ❌ Not supported |
| **Web Access** | ✅ Browser-ready | ❌ Desktop app | ❌ Desktop app | ❌ Desktop app |
| **Open Source & Free** | ✅ Fully open source | ❌ Partially paid | ✅ Open source | ❌ Commercial |

### Why Choose TAF-DataDev?

1. **Zero Configuration, Ready to Use**: No plugin installation needed, all SQL development features are built-in
2. **Web-Based Deployment**: Supports team collaboration without local installation
3. **End-to-End Data Development**: One-stop solution from requirement management to SQL development to metrics management
4. **Based on Apache Top-Level Projects**: Uses mature and stable technology stack with enterprise-grade reliability

## 🏗️ Technical Architecture

### Frontend Stack

- **Next.js 16**: Full-stack React framework providing SSR and routing capabilities
- **CodeMirror 6**: Modern code editor providing powerful editing experience
- **TypeScript**: Type-safe JavaScript, improving code quality
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### Backend Stack

- **Flask**: Lightweight Python web framework for rapid API development
- **SQLAlchemy**: Python's most popular ORM, supporting multiple databases
- **LangChain**: AI application development framework supporting multiple LLM models
- **Flask-SQLAlchemy**: SQLAlchemy extension for Flask

### Database Support

- **MySQL**: Supported via PyMySQL driver
- **PostgreSQL**: Supported via psycopg2 driver
- **SQLite**: Built-in support, suitable for local development

## 📸 Screenshots

![Feature Screenshot](pic/功能截图.png)

## 🚀 Quick Start

### Requirements

- Python 3.13+
- Node.js 18+
- npm or yarn

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/your-org/TAF-DataDev.git
cd TAF-DataDev
```

2. **Start the backend service**

```bash
cd data-engine-api
# Install dependencies (recommended: use uv)
uv sync
# Or use pip
pip install -r requirements.txt

# Start Flask service
python main.py
```

The backend service will start at `http://localhost:5000`

3. **Start the frontend service**

```bash
cd data-engine-web
npm install
npm run dev
```

The frontend service will start at `http://localhost:3000`

4. **Access the application**

Open your browser and visit `http://localhost:3000`

## 📚 User Guide

### Database Connection

1. Navigate to the "Database" page
2. Click "Add Database Connection"
3. Fill in connection information (MySQL/PostgreSQL/SQLite)
4. Test connection and save

### SQL Development

1. Navigate to the "SQL Development" page
2. Select database connection in the right panel
3. Write SQL statements
4. Click "Run" button to execute query
5. View results in the bottom panel

### View Table Structure

1. Select database in the right "Execution Engine" panel
2. Select the table to view
3. Click "View Table Structure" button
4. View detailed information in the bottom "Table Structure" tab

### Create Temporary Table

1. Switch to "Temporary Table Creation" tab in the bottom panel
2. Click upload button to select file (Excel/JSON/CSV)
3. Enter temporary table name
4. Click "Create Temporary Table" button

## 🛠️ Development

### Project Structure

```
TAF-DataDev/
├── data-engine-api/          # Backend API service
│   ├── api/                  # API routes
│   │   ├── database.py       # Database connection management
│   │   └── editor.py         # Editor-related API
│   ├── models/               # Data models
│   └── main.py               # Flask application entry
├── data-engine-web/          # Frontend web application
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   ├── contexts/            # React Context
│   └── lib/                 # Utility functions
└── pic/                      # Project screenshots
```

### Contributing

We welcome all forms of contributions! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).

## 🙏 Acknowledgments

This project uses the following excellent open-source projects:

- [Next.js](https://nextjs.org/) - React full-stack framework
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit
- [CodeMirror](https://codemirror.net/) - Code editor
- [LangChain](https://www.langchain.com/) - AI application development framework

## 📞 Contact Us

- Project Issues: [GitHub Issues](https://github.com/your-org/TAF-DataDev/issues)
- Project Discussions: [GitHub Discussions](https://github.com/your-org/TAF-DataDev/discussions)

---

<div align="center">

**⭐ If this project helps you, please give us a Star!**

Made with ❤️ by TAF Team

</div>
