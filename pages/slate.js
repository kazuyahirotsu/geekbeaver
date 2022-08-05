
// Import React dependencies.
import React, { useState, useMemo } from 'react';
// Import the Slate editor factory.
import { createEditor } from 'slate';

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

export default function SlatePage() {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ];
  const [value, setValue] = useState(initialValue);

  return (
    // Add the editable component inside the context.
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        console.log('val', value);
      }}
    >
      <Editable />
    </Slate>
  );
};
