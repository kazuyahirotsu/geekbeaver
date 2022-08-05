<!-- target -->
# firestore
- usernames
    - kazuya
        "uid"
- users
    - randomID
        "username"
        "displayName"
        "photoURL"
        - projects
            - firstproject
                "title":firstproject
                "slug":firstproject
                "content"
                "heartCount"
                "username"
                "uid"
                "updatedAt"
                "createdAt"
                "commentCount" <-todo
                "viewedCount" <-todo
                - comments <-todo
                    - randomID
                        "content"
                        "username"
                        "updatedAt"
                        "createdAt"
                - hearts
                    - uid
                        "uid"
                - posts
                    - firstupdate
                        "slug":firstupdate
                        "content"
                        "heartCount"
                        "username"
                        "uid"
                        "updatedAt"
                        "createdAt"
                        "commentCount" <-todo
                        "viewedCount" <-todo
        - liked <-todo
            - projects
                - randomID
                    "uid"
                    "slug"
            - posts
                - randomID
                    "uid"
                    "slug"

# storage
- uploads