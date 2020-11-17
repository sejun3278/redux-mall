import React, { Component } from 'react';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import '../css/ck.css';

class CKeditor extends Component {
    render() {
        const { _saveContents } = this.props;

        return (
            <div>
                <CKEditor
                    editor={ ClassicEditor }
                    data="<p></p>"
                    onReady={ editor => {
                        // You can store the "editor" and use when it is needed.
                        // console.log( 'Editor is ready to use!', editor );
                    } }
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        
                        _saveContents(JSON.stringify(data));
                        // console.log( { event, editor, data } );
                    } }
                    onBlur={ ( event, editor ) => {
                        const data = editor.getData();

                        _saveContents(JSON.stringify(data));

                        // console.log( 'Blur.', editor );
                    } }
                    onFocus={ ( event, editor ) => {
                        // console.log( 'Focus.', editor );
                    } }
                />
            </div>
        );
    }
}

export default CKeditor;
