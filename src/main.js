import plugin from '../plugin.json';
import asciidoctor from 'asciidoctor'

class AcodePlugin {

  async init($page, cacheFile, cacheFileUrl) {
    // plugin initialisation 
    this.asciidoctor = asciidoctor()


    $page.id = "AsciiDoc-Viewer";
    this.$page = $page;

    this.$runBtn = tag("span", {
      className: "icon play_arrow",
      attr: { action: "run" },
      onclick: this.run.bind(this),
    });

    this.checkRunnable();
    editorManager.on("switch-file", this.checkRunnable.bind(this));
    editorManager.on("rename-file", this.checkRunnable.bind(this));
  }

  checkRunnable() {
    const file = editorManager.activeFile;
    this.$runBtn.remove?.();

    if (file?.name.endsWith(".asciidoc") || file?.name.endsWith(".adoc")) {
      const header = document.querySelector("#root header");
      header?.insertBefore(this.$runBtn, header.lastChild);
    }
  }

  async run() {
    // Convert the text into an HTML fragment
    const htmlSnippet = this.asciidoctor.convert(editorManager.activeFile.session.getValue());

    this.$page.settitle("AsciiDoc Viewer");

    const fullHtml = `
        <link rel="stylesheet" href="${this.baseUrl}assets/page.css">
        <style>
            /* Force the viewer page itself to be white */
            #AsciiDoc-Viewer, .article, body { 
                background-color: #ffffff !important; 
                color: #333333 !important;
            }
        </style>
        <div class="article">
            ${htmlSnippet}
        </div>
    `;

    this.$page.innerHTML = fullHtml;
    this.$page.show();
  }



  async destroy() {
    // plugin clean up
  }
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    acodePlugin.baseUrl = baseUrl;
    await acodePlugin.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}
