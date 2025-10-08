# zasocaravita-syllable-generator

## MediaWiki Upload

Populate a `.env` file in the project root when you want the generated SVGs to be uploaded automatically to a MediaWiki instance:

```
MEDIAWIKI_API_URL=https://example.org/w/api.php
MEDIAWIKI_USERNAME=YourBotUser
MEDIAWIKI_PASSWORD=YourBotPassword
# Optional settings:
# MEDIAWIKI_UPLOAD_FILENAME_TEMPLATE=zasocaravita-{syllable}.svg
# MEDIAWIKI_UPLOAD_COMMENT=Auto-upload of {basename}
# MEDIAWIKI_UPLOAD_TEXT== Summary ==\nAuto-uploaded glyph for {syllable}.
# MEDIAWIKI_UPLOAD_IGNORE_WARNINGS=true
# MEDIAWIKI_UPLOAD_ENABLED=true
```

Placeholders `{basename}` (local file name) and `{syllable}` (the syllable label) are expanded inside the optional templates. Leave the `.env` file absent or remove the required variables to skip the upload step.

Rendered SVGs rely on the CSS `currentColor` keyword for their stroke, so they automatically adopt the surrounding text color when embedded inline. Re-run the generator to overwrite existing files whenever you change the styling logic.
