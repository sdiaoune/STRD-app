import * as ImageManipulator from 'expo-image-manipulator';
import { Image as RNImage } from 'react-native';

export interface CompressedImageResult {
  uri: string;
  fileExt: 'jpg';
  mimeType: 'image/jpeg';
}

export async function compressAvatarImage(inputUri: string): Promise<CompressedImageResult> {
  const size = await new Promise<{ w: number; h: number }>((resolve, reject) =>
    RNImage.getSize(inputUri, (w, h) => resolve({ w, h }), reject)
  );

  const action = size.w >= size.h ? { resize: { width: 256 } } : { resize: { height: 256 } };

  const result = await ImageManipulator.manipulateAsync(
    inputUri,
    [action],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  return { uri: result.uri, fileExt: 'jpg', mimeType: 'image/jpeg' };
}


