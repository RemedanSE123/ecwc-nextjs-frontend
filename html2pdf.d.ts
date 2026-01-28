declare module "html2pdf.js" {
  const html2pdf: () => {
    set: (options: unknown) => { from: (element: HTMLElement) => { save: () => Promise<void> } }
  }
  export default html2pdf
}
