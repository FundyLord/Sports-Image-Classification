#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$(pwd)}"
GEN_DATE="$(date +%F)"

if [[ ! -d "$ROOT_DIR" ]]; then
  echo "Error: directory not found: $ROOT_DIR" >&2
  exit 1
fi

cd "$ROOT_DIR"

# Build stable manifests.
find . -type d | sed 's|^\./||' | sort > /tmp/sic_dirs.txt
find . -type f | sed 's|^\./||' | sort > /tmp/sic_files.txt

file_desc() {
  local f="$1"
  local b
  local e

  b="$(basename "$f")"
  e="${b##*.}"

  case "$b" in
    manage.py) echo "Django management entry point for administrative tasks (runserver, migrations, etc.)."; return ;;
    db.sqlite3) echo "SQLite database file used by the Django backend."; return ;;
    requirements.txt) echo "Dependency list for reproducible environment setup."; return ;;
    package.json) echo "Node package manifest defining frontend scripts and dependencies."; return ;;
    README.md) echo "Documentation for this folder (includes structure and file purposes)."; return ;;
    vite.config.ts) echo "Vite build/dev server configuration for the React frontend."; return ;;
    tsconfig.json|tsconfig.app.json|tsconfig.node.json) echo "TypeScript compiler configuration file."; return ;;
    eslint.config.js) echo "ESLint configuration for code quality and style checks."; return ;;
    index.html) echo "HTML entry page used by Vite to bootstrap the frontend app."; return ;;
    main.tsx) echo "Frontend entry point that mounts the React application."; return ;;
    App.tsx) echo "Root React component controlling the main UI composition."; return ;;
    index.css) echo "Global stylesheet defining base frontend styles."; return ;;
    api.ts) echo "Frontend API helper module for backend communication."; return ;;
    types.ts) echo "Shared TypeScript type definitions used across frontend code."; return ;;
    settings.py) echo "Django project settings (apps, middleware, database, and configuration)."; return ;;
    urls.py) echo "URL routing definitions mapping endpoints to views."; return ;;
    views.py) echo "Request handlers / API views implementing backend behavior."; return ;;
    models.py) echo "Django ORM models defining database schema entities."; return ;;
    admin.py) echo "Django admin site registrations and admin customizations."; return ;;
    apps.py) echo "Django app configuration metadata."; return ;;
    __init__.py) echo "Marks this directory as a Python package."; return ;;
    asgi.py) echo "ASGI application entry point for async-capable deployments."; return ;;
    wsgi.py) echo "WSGI application entry point for synchronous deployments."; return ;;
    seed_data.py) echo "Data seeding script to populate initial project data."; return ;;
    model_utils.py) echo "Utility helpers for loading and running classification models."; return ;;
    classification.ipynb|Image_Classification.ipynb) echo "Jupyter notebook for model experimentation, training, and evaluation workflows."; return ;;
    sports.csv) echo "Tabular metadata/labels used for the sports classification dataset."; return ;;
  esac

  case "$e" in
    py) echo "Python source file implementing project logic."; return ;;
    ts|tsx|js|jsx) echo "Frontend source file for application logic or UI components."; return ;;
    css) echo "Stylesheet used to control presentation and layout."; return ;;
    json) echo "Configuration or structured metadata file in JSON format."; return ;;
    ipynb) echo "Jupyter notebook containing code, outputs, and narrative experimentation."; return ;;
    pth) echo "Serialized trained model weights/checkpoint used for inference or fine-tuning."; return ;;
    sqlite3|db) echo "Database file storing persisted application data."; return ;;
    md) echo "Markdown documentation file."; return ;;
    png|jpg|jpeg|webp|bmp|gif) echo "Image asset or dataset sample used for sports classification."; return ;;
    csv) echo "Comma-separated dataset or metadata file."; return ;;
    yml|yaml) echo "YAML configuration file."; return ;;
    lock) echo "Dependency lockfile pinning exact package versions."; return ;;
  esac

  if [[ "$f" == *"/migrations/"* ]]; then
    echo "Django migration file describing schema evolution."
    return
  fi

  echo "Project file used within this folder's workflow."
}

while IFS= read -r dir; do
  local_abs=""
  local_title=""

  if [[ "$dir" == "." ]]; then
    local_abs="$(pwd)"
    local_title="$(basename "$(pwd)")"
  else
    local_abs="$(pwd)/$dir"
    local_title="$dir"
  fi

  tmp_file="$(mktemp)"
  {
    echo "# Folder README: $local_title"
    echo
    echo "Auto-generated on $GEN_DATE."
    echo
    echo "## Purpose"
    echo "This README documents the direct contents of this folder and describes what each file is used for."
    echo
    echo "## Subfolders"

    mapfile -d '' subdirs < <(find "$local_abs" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)
    if [[ ${#subdirs[@]} -eq 0 ]]; then
      echo "- (none)"
    else
      for sd in "${subdirs[@]}"; do
        name="$(basename "$sd")"
        echo "- $name/: Child folder containing related files and/or deeper structure."
      done
    fi

    echo
    echo "## Files"

    mapfile -d '' files < <(find "$local_abs" -mindepth 1 -maxdepth 1 -type f -print0 | sort -z)
    if [[ ${#files[@]} -eq 0 ]]; then
      echo "- (none)"
    else
      for f in "${files[@]}"; do
        name="$(basename "$f")"
        relf="${f#$(pwd)/}"
        desc="$(file_desc "$relf")"
        echo "- $name: $desc"
      done
    fi
  } > "$tmp_file"

  mv "$tmp_file" "$local_abs/README.md"
done < /tmp/sic_dirs.txt

# Rebuild root README with complete tree.
{
  echo "# $(basename "$(pwd)")"
  echo
  echo "Auto-generated master index on $GEN_DATE."
  echo
  echo "## Summary"
  echo "- Total folders: $(wc -l < /tmp/sic_dirs.txt)"
  echo "- Total files: $(wc -l < /tmp/sic_files.txt)"
  echo "- This repository includes a README.md in every folder."
  echo
  echo "## Complete Directory Tree (All Files and Folders)"
  echo
  echo "Legend: [D] folder, [F] file"
  echo

  {
    awk '{print "D\t"$0}' /tmp/sic_dirs.txt
    awk '{print "F\t"$0}' /tmp/sic_files.txt
  } | sort -t $'\t' -k2,2 | awk -F '\t' '
    {
      type=$1
      path=$2
      if (path==".") {
        print "- [D] ./"
        next
      }

      depth=gsub("/","/",path)
      name=path
      sub(/^.*\//,"",name)
      indent=""
      for (i=0; i<depth; i++) indent=indent "  "

      if (type=="D") {
        print indent "- [D] " name "/"
      } else {
        print indent "- [F] " name
      }
    }'
} > README.md

echo "Done."
echo "Directories: $(wc -l < /tmp/sic_dirs.txt)"
echo "Files:       $(wc -l < /tmp/sic_files.txt)"
echo "READMEs:     $(find . -type f -name 'README.md' | wc -l)"
