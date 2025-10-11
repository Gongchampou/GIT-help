 # Git for Beginners: Quick Guide

 A compact, practical reference to get you productive with Git fast.

 ## Install and First-Time Setup

 - **Install Git**: https://git-scm.com/downloads
 - **Set your identity** (required for commits):

 ```bash
 git config --global user.name "Your Name"
 git config --global user.email "you@example.com"
 git config --global init.defaultBranch main
 # Optional (nice to have)
 git config --global core.editor "code --wait"
 git config --global pull.rebase false
 ```

 ## Start a Project
 ### start new project
 - Add new repo or create new repo
 ```bash
 echo "# project name" >> README.md (auto add readme file)
git init
git add README.md (option)
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Gongchampou(user name)/project-name.git
git push -u origin main
```
- clone existing repo to your local storage like your drive or pendrive
 ```bash
git clone https://github.com/user/project-name.git
cd project-name (give direction)
 ```
- recall the existing repo if deleted the local repo
```bash
# recall the existing repo if deleted the local repo
    git init
    git clone https://github.com/user-name/project-name.git
    cd project-name
    git remote -v
```
- You should see something like:
```bash
    origin  https://github.com/user-name/project-name.git (fetch)
    origin  https://github.com/user-name/project-name.git (push)
```
- Then you can push the existing repo that clone from github to the new local to that github repo
```bash
    git remote add origin https://github.com/user-name/project-name.git
    git branch -M main
    git push -u origin main
 ```
- After this you can start working on the project and push, commit, pull, merge, etc.
```bash
    git add .
    git commit -m "message"
    git push origin main
    git pull origin main --rebase
    git push origin main
```
---
```bash
    - **New repository** in the current folder:
    ```bash
    git init
    echo "# My Project" > README.md
    git add .
    git commit -m "Initial commit"
    ```

    - **Clone an existing repository**:
    ```bash
    git clone https://github.com/user/repo.git
    cd repo
    ```
---
 

 ## Everyday Basics

 - **See what's changed**:
 ```bash
 git status
 git diff           # unstaged changes
 git diff --staged  # staged changes
 ```

 - **Stage and commit**:
 ```bash
 git add file1 file2     # or: git add .
 git commit -m "Describe what changed"
 git commit -am "Quick commit for tracked files"  # adds & commits tracked files
 ```

 - **View history**:
 ```bash
 git log --oneline
 git log --oneline --graph --decorate --all
 ```
 # check the website for webflow.
 https://gongchampou.github.io/GIT-help
 - you can fork it and deploy in your github page to check how the webflow for more interesting in git flow-chart:
1. fork it
2. deploy in your github page. before deploy you should have a github page.
3. open the forked repo in your github page. make it public
5. click the setting in the right side.
6. check the page
7. click the pages in the left side.
8. under the build and deploy, you will branch option change that to main  and give domain name and deploy it.
4. check the website for more interesting in git flow-chart.
 ## Branching

 - **List/create/switch**:
 ```bash
 git branch                    # list branches
 git switch -c feature/login   # create and switch
 # or older syntax:
 git checkout -b feature/login
 ```

 - **Merge a branch into main**:
 ```bash
 git switch main
 git merge feature/login
 ```

 ## Work with Remotes (GitHub, GitLab, etc.)

 - **Connect local repo to a remote**:
 ```bash
 git remote add origin https://github.com/user/repo.git
 ```

 - **Push the current branch first time**:
 ```bash
 git push -u origin main
 ```

 - **Pull latest changes / Fetch without merging**:
 ```bash
 git pull          # fetch + merge (default)
 git fetch         # only downloads, no merge
 ```

 - **Push subsequent changes**:
 ```bash
 git push
 ```

 ## Undo & Fix Mistakes

 - **Discard local changes in a file (not staged)**:
 ```bash
 git restore path/to/file
 ```

 - **Unstage a file you added by mistake**:
 ```bash
 git restore --staged path/to/file
 ```

- **Edit the last commit message or include forgotten files**:
```bash
git commit --amend
# then push with force-with-lease if already pushed
git push --force-with-lease
```

- **Revert a specific commit (safe on shared branches)**:
```bash
git revert <commit_sha>
```

- **Move HEAD back (be careful)**:
```bash
# Move back relative to current commit
git reset --soft HEAD~1    # keep changes staged
git reset --mixed HEAD~1   # keep changes in working tree (default)
git reset --hard HEAD~1    # discard changes permanently

# Reset to a specific commit by ID (SHA)
git reset --soft <commit_sha>
git reset --mixed <commit_sha>
git reset --hard <commit_sha>
```

- **Push after rewriting history**:
```bash
git push --force-with-lease
```

## Stash (Save Work-in-Progress)

```bash
git stash push -m "WIP: message"
git stash list
git stash show -p stash@{0}
git stash pop            # apply and drop
# or keep it:
git stash apply stash@{0}
```

## Tags (Versions/Releases)

```bash
git tag v1.0.0           # lightweight tag
git tag -a v1.0.0 -m "Release 1.0.0"  # annotated tag
git push origin v1.0.0   # push single tag
# or all tags:
git push --tags
```

## .gitignore (Ignore Files)

- Create a `.gitignore` in your project root. Example:
```gitignore
node_modules/
.env
.DS_Store
*.log
build/
dist/
```

- Check what's ignored and why:
```bash
git check-ignore -v path/to/file
```

## Useful Diffs & Logs

```bash
git diff main..feature/login
git log main..feature/login --oneline --graph
git show <commit_sha>
```

## Handy Aliases (Optional)

```bash
git config --global alias.st "status -sb"
git config --global alias.co "checkout"
git config --global alias.sw "switch"
git config --global alias.lg "log --oneline --graph --decorate --all"
```

## Typical Workflow

1. Make a branch: `git switch -c feature/thing`
2. Edit files, then: `git add . && git commit -m "message"`
3. Sync often: `git pull` before merging; resolve conflicts if any
4. Push your branch: `git push -u origin feature/thing`
5. Open a Pull Request and get it reviewed
6. Merge to `main`, update local: `git switch main && git pull`

---

Tips:
- **Small commits** with clear messages are easier to review and revert.
- **Never hard reset shared branches** (like `main`). Use `revert` instead.
- Use **branches** for features and fixes; keep `main` deployable.
