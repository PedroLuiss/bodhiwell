
export class SimpleSplitText {
    element: HTMLElement;
    chars: HTMLElement[] = [];
    words: HTMLElement[] = [];
    lines: HTMLElement[] = [];
    originalHTML: string;

    constructor(element: HTMLElement, options: { type?: string } = {}) {
        this.element = element;
        this.originalHTML = element.innerHTML;
        this.split(options.type || "chars,words,lines");
    }

    split(type: string) {
        this.element.innerHTML = this.originalHTML;
        const text = this.element.innerText;
        const wordTexts = text.split(/\s+/).filter(w => w.trim().length > 0);

        this.words = wordTexts.map(w => {
            const span = document.createElement('div');
            span.style.display = 'inline-block';
            span.style.position = 'relative';
            span.classList.add('split-word');
            span.innerText = w;
            return span;
        });
        if (type.includes('chars')) {
            this.words.forEach(wordSpan => {
                const chars = wordSpan.innerText.split('');
                wordSpan.innerHTML = '';
                chars.forEach(c => {
                    const charSpan = document.createElement('div');
                    charSpan.style.display = 'inline-block';
                    charSpan.style.position = 'relative';
                    charSpan.classList.add('split-char');
                    charSpan.innerText = c;
                    wordSpan.appendChild(charSpan);
                    this.chars.push(charSpan);
                });
            });
        }

        this.element.innerHTML = '';
        this.words.forEach((w, i) => {
            this.element.appendChild(w);
            if (i < this.words.length - 1) {
                this.element.appendChild(document.createTextNode(' '));
            }
        });

        if (type.includes('lines')) {
            const linesMap = new Map<number, HTMLElement[]>();
            this.words.forEach(w => {
                const top = Math.floor(w.offsetTop / 5) * 5;
                if (!linesMap.has(top)) {
                    linesMap.set(top, []);
                }
                linesMap.get(top)!.push(w);
            });

            const sortedTops = Array.from(linesMap.keys()).sort((a, b) => a - b);

            this.lines = [];
            this.element.innerHTML = '';

            sortedTops.forEach(top => {
                const lineDiv = document.createElement('div');
                lineDiv.classList.add('split-line');
                const wordsInLine = linesMap.get(top)!;
                wordsInLine.forEach((w, i) => {
                    lineDiv.appendChild(w);
                    if (i < wordsInLine.length - 1) {
                        lineDiv.appendChild(document.createTextNode(' '));
                    }
                });

                this.element.appendChild(lineDiv);
                this.lines.push(lineDiv);
            });
        }
    }

    revert() {
        this.element.innerHTML = this.originalHTML;
        this.chars = [];
        this.words = [];
        this.lines = [];
    }
}
