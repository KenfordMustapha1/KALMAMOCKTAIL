import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPreOrderByToken, redeemPreOrder } from '../../services/preOrderService';
import { extractPreOrderToken } from '../../utils/preOrderUtils';
import { formatPrice, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const hasBarcodeDetector = () => 'BarcodeDetector' in window;

const AdminScanPage = () => {
  const { token: tokenParam } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const scannerRef = useRef(null);
  const [manualInput, setManualInput] = useState('');
  const [inputError, setInputError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [needsManualScan, setNeedsManualScan] = useState(!hasBarcodeDetector());

  const handleScanResult = useCallback(
    (rawValue) => {
      const token = extractPreOrderToken(rawValue);
      if (!token) return false;

      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current = null;
      }

      navigate(`/admin/scan/${token}`);
      return true;
    },
    [navigate]
  );

  useEffect(() => {
    if (tokenParam) return undefined;

    let stream;
    let animationId;
    let mounted = true;

    const startScanner = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (mounted) {
          setCameraError('Camera not supported. Paste the customer link below.');
        }
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        const video = videoRef.current;
        if (!video || !mounted) return;

        video.srcObject = stream;
        await video.play();

        scannerRef.current = {
          stop: () => {
            if (animationId) cancelAnimationFrame(animationId);
            stream.getTracks().forEach((track) => track.stop());
          },
        };

        if (mounted) {
          setScanning(true);
          setCameraError(null);
        }

        if (hasBarcodeDetector()) {
          detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });

          const scanLoop = async () => {
            if (!mounted || !videoRef.current || !detectorRef.current) return;

            try {
              const barcodes = await detectorRef.current.detect(videoRef.current);
              if (barcodes.length > 0 && handleScanResult(barcodes[0].rawValue)) return;
            } catch {
              // keep scanning
            }

            animationId = requestAnimationFrame(scanLoop);
          };

          scanLoop();
        }
      } catch {
        if (mounted) {
          setCameraError(
            'Could not access camera. Allow camera permission or paste the link below.'
          );
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current = null;
      }
    };
  }, [tokenParam, handleScanResult]);

  const handleManualLookup = (e) => {
    e.preventDefault();
    const token = extractPreOrderToken(manualInput);
    if (!token) {
      setInputError('Enter a valid pre-order link or token.');
      return;
    }
    setInputError(null);
    navigate(`/admin/scan/${token}`);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasBarcodeDetector()) {
      setInputError('QR image scan needs Chrome or Edge. Paste the link instead.');
      e.target.value = '';
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const bitmap = await createImageBitmap(file);
      const barcodes = await detector.detect(bitmap);
      bitmap.close();

      if (barcodes.length > 0 && handleScanResult(barcodes[0].rawValue)) {
        e.target.value = '';
        return;
      }

      setInputError('No valid pre-order QR found in that image.');
    } catch {
      setInputError('Could not read that image. Paste the link instead.');
    }

    e.target.value = '';
  };

  if (tokenParam) {
    return <AdminScanRedeem token={tokenParam} />;
  }

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-bold text-white mb-2">Scan Customer QR</h1>
      <p className="text-kalma-muted mb-8">
        Scan the customer&apos;s pre-order QR code to place their order.
      </p>

      <div className="card p-4 mb-6 overflow-hidden">
        <video
          ref={videoRef}
          className="w-full rounded-lg bg-black aspect-square object-cover"
          muted
          playsInline
        />
        {scanning && !needsManualScan && (
          <p className="text-kalma-muted text-sm text-center mt-3">
            Point camera at customer QR code
          </p>
        )}
        {scanning && needsManualScan && (
          <p className="text-yellow-400 text-sm text-center mt-3">
            Live QR scan works best in Chrome or Edge. You can also paste the link below, or scan with your phone camera app.
          </p>
        )}
        {cameraError && (
          <p className="text-yellow-400 text-sm text-center mt-3">{cameraError}</p>
        )}
      </div>

      <div className="card p-6 mb-6">
        <label className="block text-sm text-kalma-muted mb-2">Upload QR image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-kalma-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-kalma-gold file:text-kalma-dark file:cursor-pointer"
        />
      </div>

      <form onSubmit={handleManualLookup} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm text-kalma-muted mb-2">Pre-order link or token</label>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste link or token here"
            className="input-field"
          />
        </div>
        {inputError && <ErrorMessage message={inputError} />}
        <button type="submit" className="btn-primary w-full">
          Look up order
        </button>
      </form>
    </div>
  );
};

const AdminScanRedeem = ({ token }) => {
  const navigate = useNavigate();
  const [preOrder, setPreOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        const data = await getPreOrderByToken(token);
        setPreOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPreOrder();
  }, [token]);

  const isDisabled = preOrder?.expired;

  const handleRedeem = async () => {
    setRedeeming(true);
    setError(null);
    try {
      await redeemPreOrder(token);
      navigate('/admin/orders', { state: { message: 'Customer pre-order placed successfully!' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  if (error && !preOrder) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <ErrorMessage message={error} />
        <p className="text-kalma-muted text-sm mt-4 text-center">
          This QR may have already been used. Each pre-order can only be placed once.
        </p>
        <button onClick={() => navigate('/admin/scan')} className="btn-secondary mt-6 w-full">
          Scan another QR
        </button>
      </div>
    );
  }

  const total = preOrder.items.reduce(
    (sum, item) => sum + item.drink.price * item.quantity,
    0
  );

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-bold text-white mb-2">Customer Pre-order</h1>
      <p className="text-kalma-muted mb-8">Review and confirm this order for the customer.</p>

      {preOrder.expired && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
          This pre-order has expired.
        </div>
      )}

      {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap justify-between gap-2 mb-4 text-sm text-kalma-muted">
          <span>Customer: {preOrder.user?.name}</span>
          <span>{preOrder.user?.email}</span>
        </div>
        <p className="text-kalma-muted text-sm mb-4">Expires: {formatDate(preOrder.expiresAt)}</p>

        <div className="space-y-3">
          {preOrder.items.map((item) => (
            <div key={item.drink._id} className="flex justify-between text-sm">
              <span className="text-kalma-muted">
                {item.drink.name} × {item.quantity}
              </span>
              <span className="text-white">
                {formatPrice(item.drink.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-kalma-border mt-4 pt-4 flex justify-between">
          <span className="font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-kalma-gold">{formatPrice(total)}</span>
        </div>
      </div>

      {!isDisabled && (
        <button
          onClick={handleRedeem}
          disabled={redeeming}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
        >
          {redeeming ? <LoadingSpinner size="sm" /> : 'Confirm & Place Order'}
        </button>
      )}

      <button onClick={() => navigate('/admin/scan')} className="btn-secondary w-full">
        Scan another QR
      </button>
    </div>
  );
};

export default AdminScanPage;
