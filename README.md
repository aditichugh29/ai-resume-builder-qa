# AI Resume Builder - QA Testing

QA work for my AI Resume Builder project (app source: https://github.com/aditichugh29/ai-resume-builder).

- `QA_Test_Summary_Report.pdf` - test summary report
- `QA_Test_Sheet.xlsx` - test cases, defects, summary, automation
- `automation/` - Playwright tests

**Result:** 77 test cases executed (UI, registration, API in Postman, MongoDB): 69 passed, 8 failed, 7 defects reported.
Plus 3 Playwright UI tests (API mocked), all passing.

## Run the automation
Clone the app repo next to this one, then:
```
cd ai-resume-builder/client && npm install
cd ../../ai-resume-builder-qa/automation && npm install
npx playwright install chromium
npx playwright test
```
