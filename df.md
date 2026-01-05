- verification: verify 
  - all rules are respectred
  - all requirements are accounted for and met 
  - and ensure code quality for all generated code thus far

- follow plan
  - start with entry point
  - define app requirements and spec out the plan 
  - follow the plan by creating and completing tasks
  - read tasks and implement the next incomplete task until all tasks are complete

- always spec out the plan:
  - spec out requirements within rules and instructions
  - phased or tiered implementation steps
    - scaffold out project/site
    - scaffold out tasks based on requirements 
  - always implement accessibility, comprehensive and robust testing, comprehensive and robust code commenting, comprehensive and robust app documentation 

  - rules:
1) Always start with the entry point (which contains all rules and iteration protocols)
2) Execute one focused iteration at a time followed by verification, code quality checks/smoke tests for syntax, server responses, logic, bugs, edge cases, then handle file updates to changelogs and tasks and plan additions and updates.
3) After the iteration, run code quality checks and smoke tests (syntax, server responses).
4) Update `static/spec-kit/tasks.json` statuses using the `manage_todo_list` tool.
5) Update this ENTRYPOINT with any noteworthy decisions.
6) Read the user's instructions again and repeat until all tasks in `tasks.json` are `completed`.
    - ending result should be production-ready, enterprise-level application
    - CIworkflow should exist as spec-kit entry point all the way through user confirmation of enterprise-level, production-ready application