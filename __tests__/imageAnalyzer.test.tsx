import { PassportData } from '@/app/types';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { analyzeImage, getPresignedPutUrl } from '../src/app/actions/s3actions';
import ImageAnalyser from '../src/app/components/imageAnalyser';
import { putImageToS3 } from '../src/app/utils/putImageToS3';

jest.mock('../src/app/actions/s3actions');
jest.mock('../src/app/utils/putImageToS3');

const mockGetPresignedPutUrl = getPresignedPutUrl as jest.MockedFunction<typeof getPresignedPutUrl>;
const mockAnalyzeImage = analyzeImage as jest.MockedFunction<typeof analyzeImage>;
const mockPutImageToS3 = putImageToS3 as jest.MockedFunction<typeof putImageToS3>;

describe('ImageAnalyser', () => {
  beforeEach(() => {
    render(<ImageAnalyser id="test-id" />);
  });

  it('renders a file picker input', () => {
    const fileInput = screen.getByLabelText(/choose a file/i);
    expect(fileInput).toBeInTheDocument();
  });

  it('displays a preview image when file has been selected', async () => {
    const fileInput = screen.getByLabelText(/choose a file/i);
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const img = screen.getByAltText(/file upload preview/i);
      expect(img).toBeInTheDocument();
    });
  });

  it('successfully uploads and analyses a file', async () => {
    const urlResult = { data: 'test-presigned-url' };
    const putToS3Result = { data: undefined };
    const analysisResult = { data: { dateOfBirth: '10/07/1995', expiryDate: '03/09/2030' } as PassportData };

    mockGetPresignedPutUrl.mockResolvedValue(urlResult);
    mockPutImageToS3.mockResolvedValue(putToS3Result);
    mockAnalyzeImage.mockResolvedValue(analysisResult);

    const fileInput = screen.getByLabelText(/choose a file/i);
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const analyzeButton = screen.getByText(/analyse/i);
      fireEvent.click(analyzeButton);
    });

    await waitFor(() => {
      expect(mockGetPresignedPutUrl).toHaveBeenCalled();
      expect(mockPutImageToS3).toHaveBeenCalled();
      expect(mockAnalyzeImage).toHaveBeenCalled();
      expect(screen.getByText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByText(/expiry date/i)).toBeInTheDocument();
    });
  });

  it('displays an error if user uploads a bad file format', async () => {
    const errorMsg = "bad file error";
    const putToS3Result = { uiError: errorMsg };
    mockPutImageToS3.mockResolvedValue(putToS3Result);

    const fileInput = screen.getByLabelText(/choose a file/i);
    const file = new File(['test'], 'test.png', { type: 'file/txt' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const analyzeButton = screen.getByText(/analyse/i);
      fireEvent.click(analyzeButton);
    });

    await waitFor(() => {
      const errorElem = screen.getByText(errorMsg);
      expect(errorElem).toBeInTheDocument();
    });
  });
});