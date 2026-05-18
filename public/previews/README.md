# Preview Images

이 폴더의 PNG들은 각 드레스 옵션의 클로즈업 미리보기입니다.

**한 번만 생성하고 git에 커밋합니다.** 웹앱은 이 정적 파일을 `<img>` 태그로 로드하며, 실행 중에 Gemini API를 호출하지 않습니다.

## 생성 방법 (개발자만 필요)

```bash
export GEMINI_API_KEY=...
# (선택) export GEMINI_MODEL=gemini-3-pro-image-preview

npm run generate-previews
```

~113장 생성, 약 10분, 약 $4~10 USD 소요. 이미 존재하는 파일은 건너뜁니다. 강제로 다시 생성하려면 `npm run generate-previews -- --force`.

생성 후 결과를 git에 commit + push 하면 모든 사용자가 미리보기를 보게 됩니다.
