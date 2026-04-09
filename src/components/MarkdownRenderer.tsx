import React from 'react';

/** Simple markdown renderer for AI responses */
export const MarkdownRenderer = ({ text }: { text: string | undefined }) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows: string[] = [];
  
  const processText = (str: string) => {
    // Very basic bold and italic replacement
    let parsed = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Render emojis wrapped in some simple tags if needed, but strings are fine
    return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('|')) {
      inTable = true;
      if (!line.includes('---')) {
        tableRows.push(line);
      }
      continue;
    } else if (inTable) {
      // End of table
      elements.push(
        <table className="chat-table" key={`table-${i}`}>
          <tbody>
            {tableRows.map((row, rIdx) => (
              <tr key={`tr-${rIdx}`}>
                {row.split('|').filter(c => c.trim()).map((cell, cIdx) => (
                  rIdx === 0 ? <th key={`th-${cIdx}`}>{processText(cell.trim())}</th> : <td key={`td-${cIdx}`}>{processText(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      inTable = false;
      tableRows = [];
    }

    if (line.startsWith('## ')) {
      elements.push(<h3 key={`h3-${i}`} className="chat-h3">{processText(line.replace('## ', ''))}</h3>);
    } else if (line.startsWith('# ')) {
      elements.push(<h2 key={`h2-${i}`} className="chat-h2">{processText(line.replace('# ', ''))}</h2>);
    } else if (line.startsWith('- ')) {
      elements.push(<li key={`li-${i}`} className="chat-li">{processText(line.replace('- ', ''))}</li>);
    } else if (line.trim().length > 0) {
      elements.push(<p key={`p-${i}`}>{processText(line)}</p>);
    }
  }
  
  // Catch trailing table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <table className="chat-table" key={`table-end`}>
        <tbody>
          {tableRows.map((row, rIdx) => (
            <tr key={`tr-${rIdx}`}>
              {row.split('|').filter(c => c.trim()).map((cell, cIdx) => (
                rIdx === 0 ? <th key={`th-${cIdx}`}>{processText(cell.trim())}</th> : <td key={`td-${cIdx}`}>{processText(cell.trim())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return <>{elements}</>;
};
