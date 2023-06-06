import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './ImagePackUpload.scss';

import initMatrix from '../../../client/initMatrix';
import { scaleDownImage } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import Input from '../../atoms/input/Input';
import IconButton from '../../atoms/button/IconButton';
import CirclePlusIC from '../../../../public/res/ic/outlined/circle-plus.svg';

function ImagePackUpload({ onUpload }) {
  const mx = initMatrix.matrixClient;
  const inputRef = useRef(null);
  const [shortcodes, setShortcodes] = useState([]);
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!images.length) return;

    setProgress(true);

    await Promise.all(
      images.map((image, i) =>
        scaleDownImage(image, 512, 512)
          .then((scaled) => mx.uploadContent(scaled))
          .then((uploaded) => onUpload(shortcodes[i], uploaded.content_uri))
      )
    );

    setProgress(false);
    setImages([]);
    setShortcodes([]);
  };

  const handleFileChange = (evt) => {
    const files = [...evt.target.files];
    if (!files.length) return;

    setImages(files);
    setShortcodes(files.map((file) => file.name.slice(0, file.name.indexOf('.'))));
  };
  const handleRemove = (index) => {
    images.splice(index, 1);
    shortcodes.splice(index, 1);
    setImages([...images]);
    setShortcodes([...shortcodes]);
    if (!images.length) inputRef.current.value = null;
  };

  return (
    <form onSubmit={handleSubmit} className="image-pack-upload">
      <input
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        type="file"
        accept=".png, .gif, .webp"
        required
        multiple
      />
      {!images.length ? (
        <Button onClick={() => inputRef.current.click()}>Import images</Button>
      ) : (
        images.map((image, i) => (
          <div className="image-pack-upload__filewrapper" key={image.name}>
            <div className="image-pack-upload__file">
              <IconButton
                onClick={() => handleRemove(i)}
                src={CirclePlusIC}
                tooltip="Remove file"
              />
              <Text>{image.name}</Text>
            </div>
            <Input
              onChange={(value) => {
                shortcodes[i] = value.trim();
                setShortcodes([...shortcodes]);
              }}
              value={shortcodes[i]}
              name="shortcodeInput"
              placeholder="shortcode"
              required
            />
          </div>
        ))
      )}

      <Button disabled={progress} variant="primary" type="submit">
        {progress ? 'Uploading...' : 'Upload'}
      </Button>
    </form>
  );
}
ImagePackUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
};

export default ImagePackUpload;
