export function splitLetters(container: HTMLElement, opentag: string, closingtag: string) {
    let tmp = '';

    const html = [...container.innerHTML!.match(/<[^>]+>/g)! || '', ''];

    container.innerHTML!.split(/<[^>]+>/g)?.forEach((string, index) => {
        return tmp += (string.replace(/\S/g, opentag + "$&" + closingtag) + html![index]);
    });

    container.innerHTML = tmp;
}

export function splitWords(container: HTMLElement, opentag: string, closingtag: string) {
    let tmp = '';

    const html = [...container.innerHTML!.match(/<[^>]+>/g)! || '', ''];
    container.innerHTML!.split(/<[^>]+>/g)?.forEach((string, index) => {
        return tmp += (string.replace(/\S+/g, opentag + "$&" + closingtag) + html![index]);
    });

    container.innerHTML = tmp;
}

function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim().replace(/\s+/g, ' ');
}

export function splitLines(container: HTMLElement, opentag: string, closingtag: string) {
    const htmlTags = [...container.innerHTML!.match(/<[^>]+>/g)! || '', ''];
    const containerSplit = container.innerHTML!.split(/<[^>]+>/g);
    const htmlClosingTags = [...container.innerHTML!.match(/<[^>]+>/g)! || ''];
    const whiteSpaces = [...container.textContent!.match(/\S+/g)!];

    splitWords(container, '<n>', '</n>');

    const spans = container.querySelectorAll('n');
    const tops: {top: number, text: string}[] = [];
    const splitPostionsTops: number[] = [0];
    
    spans.forEach(span => {
        const { top } = span.getBoundingClientRect();
        tops.push({ top, text: span.textContent as string });
    });
    
    let finalString = '';
    let lastTop = 0;
    let count = 0;

    containerSplit?.forEach((string, i) => {
        const sanitized_string = sanitizeString(string);
        const { length } = sanitized_string.split(' ');

        if (!!string) {
            splitPostionsTops.push(splitPostionsTops[i] + length);

            const splicedTops = tops.slice(splitPostionsTops[i], splitPostionsTops[i] + length);
                
            splicedTops.forEach(({top, text}) => {
                let whitespace = '';
                if (lastTop < top || lastTop > top) {
                    
                    if (htmlTags[i].includes('/') && !htmlTags[i + 1].includes('/')) {            
                        const tags = htmlClosingTags.slice(0, i + i);
                        const half = Math.ceil(tags.length / 2);
                        const openingTags = tags.slice(0, half);
                        const closingTags = tags.slice(half);
                        
                        htmlClosingTags.splice(0, i + i);
                        
                        finalString += closingTags.join('') + closingtag + opentag + openingTags.join('')
                    } else {
                        finalString += closingtag + opentag
                    }
                };
                
                // Whitespace is still an issue
                if(whiteSpaces[count] && whiteSpaces[count].includes(text)) whitespace = ' ' 
                else whiteSpaces.splice(0, 0, ' ');

                finalString += text + whitespace;
                count += 1;
                lastTop = top;
            });

        // If string is empty pass the current splitPosition and add the html tag
        } else splitPostionsTops.push(splitPostionsTops[i]);

        finalString += htmlTags[i];
    });

    container.innerHTML = finalString += closingtag;
}