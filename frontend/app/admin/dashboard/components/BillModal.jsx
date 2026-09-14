"use client";

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function BillModal({ booking, onClose }) {
  if (!booking) return null;

  // Initialize editable fields with values from booking where available
  const [billNo, setBillNo] = useState(`RT-${booking.bookingId || Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(booking.date || new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState(booking.customerName || '');
  const [orderedBy, setOrderedBy] = useState(booking.customerName || '');
  const [reportTo, setReportTo] = useState(booking.customerName || '');
  const [accommodation, setAccommodation] = useState('');
  
  const [vehicleNo, setVehicleNo] = useState(booking.vehicle?.name || 'Innova Crysta (TN-01-AB-1234)');
  const [place, setPlace] = useState(`${booking.pickup || ''} to ${booking.drop || ''}`);
  const [noOfDays, setNoOfDays] = useState(1);
  const [driverName, setDriverName] = useState('R. Kumar');
  const [driverSign, setDriverSign] = useState('');

  // Timings & Kilometers
  const [startingTime, setStartingTime] = useState(booking.time || '08:00 AM');
  const [closingTime, setClosingTime] = useState('08:00 PM');
  const [totalTime, setTotalTime] = useState('12 Hours');
  const [startingKm, setStartingKm] = useState(12500);
  const [closingKm, setClosingKm] = useState(12650);
  const [totalKms, setTotalKms] = useState(150);

  // Particulars of Duty
  const [dutyParticulars, setDutyParticulars] = useState(`${booking.tripType || 'Local'} Rental Service`);

  // Charges Breakdown
  const [hireCharges, setHireCharges] = useState(booking.estimatedFare || 2500);
  const [hoursPackage, setHoursPackage] = useState('12');
  const [kmsPackage, setKmsPackage] = useState(booking.kms || 100);

  const [extraKm, setExtraKm] = useState(0);
  const [perKmRate, setPerKmRate] = useState(18);

  const [extraHours, setExtraHours] = useState(0);
  const [perHourRate, setPerHourRate] = useState(200);

  const [driverBattaDays, setDriverBattaDays] = useState(1);
  const [driverBattaRate, setDriverBattaRate] = useState(500);

  const [nightHaltNights, setNightHaltNights] = useState(0);
  const [nightHaltRate, setNightHaltRate] = useState(600);

  const [advance, setAdvance] = useState(booking.paymentStatus === 'Paid' ? (booking.estimatedFare || 0) : 0);
  const [parkingCharges, setParkingCharges] = useState(0);

  // Next Day Instruction
  const [nextDayDate, setNextDayDate] = useState('');
  const [nextDayTime, setNextDayTime] = useState('');
  const [nextDayPlace, setNextDayPlace] = useState('');

  // UI Tab state: 'split' (side by side), 'edit' (form), 'preview' (document)
  const [viewTab, setViewTab] = useState('split');
  const [downloading, setDownloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const printRef = useRef(null);

  // Responsive mobile screen detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && viewTab === 'split') {
        setViewTab('edit');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-calculate Total Kms when starting/closing KM change
  useEffect(() => {
    const start = parseFloat(startingKm) || 0;
    const close = parseFloat(closingKm) || 0;
    if (close >= start) {
      setTotalKms(close - start);
    }
  }, [startingKm, closingKm]);

  // Derived financial totals
  const extraKmTotal = (parseFloat(extraKm) || 0) * (parseFloat(perKmRate) || 0);
  const extraHoursTotal = (parseFloat(extraHours) || 0) * (parseFloat(perHourRate) || 0);
  const driverBattaTotal = (parseFloat(driverBattaDays) || 0) * (parseFloat(driverBattaRate) || 0);
  const nightHaltTotal = (parseFloat(nightHaltNights) || 0) * (parseFloat(nightHaltRate) || 0);

  const grossTotal =
    (parseFloat(hireCharges) || 0) +
    extraKmTotal +
    extraHoursTotal +
    driverBattaTotal +
    nightHaltTotal;

  const netTotal = grossTotal + (parseFloat(parkingCharges) || 0) - (parseFloat(advance) || 0);

  // PDF Export Handler
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 2, // High DPI resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const margin = 5; // 5mm margin
      const renderWidth = pdfWidth - margin * 2;
      const renderHeight = (imgProps.height * renderWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, renderWidth, Math.min(renderHeight, pdfHeight - margin * 2));
      pdf.save(`Rider_Tours_Bill_${billNo}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: isMobile ? '0' : '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: isMobile ? '100vw' : '1320px',
        height: isMobile ? '100vh' : '94vh', borderRadius: isMobile ? '0' : '20px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
      }}>

        {/* Modal Header Bar */}
        <div style={{
          padding: isMobile ? '12px 16px' : '16px 24px', background: '#0f172a', color: '#ffffff',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          justify: 'space-between', alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '0', borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧾</span> Log Sheet / Bill
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                Booking #{booking.bookingId || 'N/A'} — {booking.customerName}
              </p>
            </div>

            {isMobile && (
              <button
                onClick={onClose}
                style={{
                  background: '#334155', color: '#94a3b8', border: 'none', width: '32px', height: '32px',
                  borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* View Toggles & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', background: '#1e293b', padding: '3px', borderRadius: '10px', border: '1px solid #334155', flex: isMobile ? 1 : 'initial' }}>
              {!isMobile && (
                <button
                  onClick={() => setViewTab('split')}
                  style={{
                    padding: '6px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                    background: viewTab === 'split' ? '#38bdf8' : 'transparent',
                    color: viewTab === 'split' ? '#0f172a' : '#94a3b8'
                  }}
                >
                  Split View
                </button>
              )}
              <button
                onClick={() => setViewTab('edit')}
                style={{
                  flex: isMobile ? 1 : 'initial', textAlign: 'center',
                  padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                  background: viewTab === 'edit' ? '#38bdf8' : 'transparent',
                  color: viewTab === 'edit' ? '#0f172a' : '#94a3b8'
                }}
              >
                ✏️ Edit Form
              </button>
              <button
                onClick={() => setViewTab('preview')}
                style={{
                  flex: isMobile ? 1 : 'initial', textAlign: 'center',
                  padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                  background: viewTab === 'preview' ? '#38bdf8' : 'transparent',
                  color: viewTab === 'preview' ? '#0f172a' : '#94a3b8'
                }}
              >
                👁️ Preview
              </button>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{
                padding: isMobile ? '8px 12px' : '8px 20px', background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 800,
                fontSize: '12px', cursor: downloading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', whiteSpace: 'nowrap'
              }}
            >
              <span>{downloading ? '⏳...' : '📥 PDF'}</span>
            </button>

            {!isMobile && (
              <button
                onClick={onClose}
                style={{
                  background: '#334155', color: '#94a3b8', border: 'none', width: '32px', height: '32px',
                  borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content Container */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#f8fafc' }}>

          {/* LEFT PANE: EDIT FORM */}
          {(viewTab === 'split' || viewTab === 'edit') && (
            <div style={{
              width: viewTab === 'split' ? '45%' : '100%',
              padding: isMobile ? '16px 12px' : '24px',
              overflowY: 'auto',
              borderRight: (viewTab === 'split' && !isMobile) ? '1px solid #e2e8f0' : 'none',
              background: '#ffffff'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                ✏️ Edit Travel & Billing Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Bill No</label>
                  <input type="text" value={billNo} onChange={(e) => setBillNo(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Customer Name</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ordered By</label>
                  <input type="text" value={orderedBy} onChange={(e) => setOrderedBy(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Report To</label>
                  <input type="text" value={reportTo} onChange={(e) => setReportTo(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Accomodation</label>
                  <input type="text" value={accommodation} onChange={(e) => setAccommodation(e.target.value)} placeholder="Self / Driver" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Vehicle & Reg No</label>
                  <input type="text" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Place / Route</label>
                  <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>No Of Days</label>
                  <input type="number" value={noOfDays} onChange={(e) => setNoOfDays(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Driver Name</label>
                  <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Duty Particulars */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Particulars of Duty</label>
                <textarea value={dutyParticulars} onChange={(e) => setDutyParticulars(e.target.value)} rows={2} style={inputStyle} />
              </div>

              {/* Timings & Kilometers Section */}
              <h4 style={sectionHeaderStyle}>⏱️ Travel Timings & KMs</h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Starting Time</label>
                  <input type="text" value={startingTime} onChange={(e) => setStartingTime(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Closing Time</label>
                  <input type="text" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Total Time</label>
                  <input type="text" value={totalTime} onChange={(e) => setTotalTime(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Starting KM</label>
                  <input type="number" value={startingKm} onChange={(e) => setStartingKm(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Closing KM</label>
                  <input type="number" value={closingKm} onChange={(e) => setClosingKm(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Total KMs (Auto)</label>
                  <input type="number" value={totalKms} readOnly style={{ ...inputStyle, background: '#f1f5f9', fontWeight: 700 }} />
                </div>
              </div>

              {/* Financial Charges Breakdown */}
              <h4 style={sectionHeaderStyle}>💰 Fare & Breakdown (Rs.)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Base Hire Charges (Rs.)</label>
                  <input type="number" value={hireCharges} onChange={(e) => setHireCharges(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Package Hours & KMs</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="text" value={hoursPackage} onChange={(e) => setHoursPackage(e.target.value)} placeholder="Hrs" style={{ ...inputStyle, width: '50%' }} />
                    <input type="text" value={kmsPackage} onChange={(e) => setKmsPackage(e.target.value)} placeholder="Kms" style={{ ...inputStyle, width: '50%' }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Extra KM (Qty x Rate/KM)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" value={extraKm} onChange={(e) => setExtraKm(e.target.value)} placeholder="Extra KM" style={{ ...inputStyle, width: '50%' }} />
                    <input type="number" value={perKmRate} onChange={(e) => setPerKmRate(e.target.value)} placeholder="Rate" style={{ ...inputStyle, width: '50%' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Extra Hours (Qty x Rate/Hr)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" value={extraHours} onChange={(e) => setExtraHours(e.target.value)} placeholder="Extra Hrs" style={{ ...inputStyle, width: '50%' }} />
                    <input type="number" value={perHourRate} onChange={(e) => setPerHourRate(e.target.value)} placeholder="Rate" style={{ ...inputStyle, width: '50%' }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Driver Batta (Days x Rate/Day)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" value={driverBattaDays} onChange={(e) => setDriverBattaDays(e.target.value)} placeholder="Days" style={{ ...inputStyle, width: '50%' }} />
                    <input type="number" value={driverBattaRate} onChange={(e) => setDriverBattaRate(e.target.value)} placeholder="Rate" style={{ ...inputStyle, width: '50%' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Night Halt (Nights x Rate/Night)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" value={nightHaltNights} onChange={(e) => setNightHaltNights(e.target.value)} placeholder="Nights" style={{ ...inputStyle, width: '50%' }} />
                    <input type="number" value={nightHaltRate} onChange={(e) => setNightHaltRate(e.target.value)} placeholder="Rate" style={{ ...inputStyle, width: '50%' }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Advance Paid (Rs.)</label>
                  <input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Parking / Toll / Permit (Rs.)</label>
                  <input type="number" value={parkingCharges} onChange={(e) => setParkingCharges(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Calculated Totals Preview */}
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                  <span>Gross Total:</span>
                  <span style={{ fontWeight: 700 }}>₹{grossTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                  <span>Net Payable Amount:</span>
                  <span style={{ color: '#059669' }}>₹{netTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Next Day Instruction */}
              <h4 style={sectionHeaderStyle}>📋 Next Day Instruction</h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Next Date</label>
                  <input type="text" value={nextDayDate} onChange={(e) => setNextDayDate(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Next Time</label>
                  <input type="text" value={nextDayTime} onChange={(e) => setNextDayTime(e.target.value)} placeholder="e.g. 09:00 AM" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Next Place</label>
                  <input type="text" value={nextDayPlace} onChange={(e) => setNextDayPlace(e.target.value)} placeholder="Location" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* RIGHT PANE: EXACT LOG SHEET DOCUMENT PREVIEW */}
          {(viewTab === 'split' || viewTab === 'preview') && (
            <div style={{
              width: viewTab === 'split' ? '55%' : '100%',
              padding: isMobile ? '12px 8px' : '24px',
              overflowY: 'auto',
              overflowX: 'auto',
              display: 'flex',
              justifyContent: isMobile ? 'flex-start' : 'center',
              alignItems: 'flex-start',
              background: '#475569'
            }}>
              {/* PRINTABLE BILL SHEET DOM ELEMENT MATCHING ORIGINAL LOG SHEET FORMAT */}
              <div
                ref={printRef}
                style={{
                  width: '780px',
                  minHeight: '1050px',
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  boxSizing: 'border-box',
                  fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif",
                  color: '#000000',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  border: '2px solid #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  fontSize: '13px'
                }}
              >
                <div>

                  {/* ── HEADER ── */}
                  <div style={{ border: '2px solid #000000', padding: '12px 16px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                    
                    {/* Left Branding */}
                    <div style={{ width: '42%' }}>
                      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '0.5px', color: '#000000', lineHeight: 1.1 }}>
                        RIDER TOURS & TRAVELS
                      </h1>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>
                        (Open 24 Hrs/365 Days)
                      </div>
                    </div>

                    {/* Center Logo Icon */}
                    <div style={{ textAlign: 'center', width: '16%' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Log Sheet</div>
                      <div style={{ fontSize: '32px', lineHeight: 1 }}>🚖</div>
                    </div>

                    {/* Right Company Info */}
                    <div style={{ width: '40%', textAlign: 'right', fontSize: '11px', lineHeight: '1.4' }}>
                      <div style={{ fontWeight: 'bold' }}>Address: No: 2/1, Chandran Street,</div>
                      <div>Maduvankarai, Guindy, Chennai-600032</div>
                      <div style={{ fontWeight: 'bold', marginTop: '2px' }}>Mobile : 9841580722 / 6382542050</div>
                      <div>Email: ridertoursandtravels6@gmail.com</div>
                    </div>
                  </div>

                  {/* ── CUSTOMER & TRIP DETAILS GRID ── */}
                  <div style={{ border: '2px solid #000000', borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    
                    {/* Left Column Details */}
                    <div style={{ borderRight: '2px solid #000000', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '110px', paddingBottom: '3px' }}>Customer</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{customerName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '110px', paddingBottom: '3px' }}>Ordered By</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{orderedBy}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '110px', paddingBottom: '3px' }}>Report To</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{reportTo}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '110px', paddingBottom: '3px' }}>Accomodation</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{accommodation || '—'}</span>
                      </div>
                    </div>

                    {/* Right Column Details */}
                    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1 }}>
                          <span style={{ fontWeight: 'bold', width: '90px', paddingBottom: '3px' }}>Date</span>
                          <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                          <span style={underlineTextStyle}>{date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 'bold' }}>Bill No</span>
                          <span>:</span>
                          <span style={{ border: '1px solid #000000', padding: '2px 8px', fontWeight: 'bold' }}>{billNo}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '90px', paddingBottom: '3px' }}>Vehicle No</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{vehicleNo}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '90px', paddingBottom: '3px' }}>Place</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{place}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '90px', paddingBottom: '3px' }}>No Of Days</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{noOfDays}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '90px', paddingBottom: '3px' }}>Driver</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{driverName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 'bold', width: '90px', paddingBottom: '3px' }}>Driver Sign</span>
                        <span style={{ marginRight: '8px', paddingBottom: '3px' }}>:</span>
                        <span style={underlineTextStyle}>{driverSign}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── USAGE CONFIRMATION & PARTICULAR OF DUTY HEADER ── */}
                  <div style={{ border: '2px solid #000000', borderTop: 'none', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>
                    <div style={{ borderRight: '2px solid #000000', padding: '6px 12px', fontWeight: 'bold', fontSize: '12px' }}>
                      I/We confirm this usage & agree to pay applicable charges.
                    </div>
                    <div style={{ padding: '6px 12px', fontWeight: 'bold', fontSize: '12px' }}>
                      Particulars of Duty : <span style={{ fontWeight: 'normal' }}>{dutyParticulars}</span>
                    </div>
                  </div>

                  {/* ── TIMINGS, KILOMETERS & CHARGES TABLE ── */}
                  <div style={{ border: '2px solid #000000', borderTop: 'none', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>

                    {/* Left Block: Timings & Kilometers Grid */}
                    <div style={{ borderRight: '2px solid #000000', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', width: '80px' }}>Closing Time</span>
                          <span style={{ marginRight: '4px' }}>:</span>
                          <span style={boxedTextStyle}>{closingTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', width: '80px' }}>Closing Km</span>
                          <span style={{ marginRight: '4px' }}>:</span>
                          <span style={boxedTextStyle}>{closingKm}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', width: '80px' }}>Starting Time</span>
                          <span style={{ marginRight: '4px' }}>:</span>
                          <span style={boxedTextStyle}>{startingTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', width: '80px' }}>Starting Km</span>
                          <span style={{ marginRight: '4px' }}>:</span>
                          <span style={boxedTextStyle}>{startingKm}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', width: '80px' }}>Total Time</span>
                          <span style={{ marginRight: '4px' }}>:</span>
                          <span style={boxedTextStyle}>{totalTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', width: '80px' }}>Total Kms</span>
                          <span style={{ marginRight: '4px' }}>:</span>
                          <span style={boxedTextStyle}>{totalKms}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Block: Charges Table Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '1px solid #000000', fontWeight: 'bold', textAlign: 'center', background: '#f8fafc', padding: '6px 0', fontSize: '11px' }}>
                      <div>Hire Charges</div>
                      <div>Hrs Per Day</div>
                      <div>Rs.</div>
                      <div>Rs.</div>
                    </div>

                  </div>

                  {/* ── CHARGES BREAKDOWN BODY ── */}
                  <div style={{ border: '2px solid #000000', borderTop: 'none', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>
                    
                    {/* Left Charges Descriptions */}
                    <div style={{ borderRight: '2px solid #000000', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>HOURS</span>
                        <span>Kilometers: {kmsPackage} Kms</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Extra KM ({extraKm})</span>
                        <span>Per KM @ ₹{perKmRate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Extra Hours ({extraHours})</span>
                        <span>Per Hours @ ₹{perHourRate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Driver Batta ({driverBattaDays} Day)</span>
                        <span>Per Day @ ₹{driverBattaRate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Night Halt ({nightHaltNights} Night)</span>
                        <span>Per Night @ ₹{nightHaltRate}</span>
                      </div>
                    </div>

                    {/* Right Column Financial Amounts Table */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={amountRowStyle}>
                        <span>Base Hire</span>
                        <span>₹{parseFloat(hireCharges || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={amountRowStyle}>
                        <span>Extra KM</span>
                        <span>₹{extraKmTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={amountRowStyle}>
                        <span>Extra Hours</span>
                        <span>₹{extraHoursTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={amountRowStyle}>
                        <span>Driver Batta</span>
                        <span>₹{driverBattaTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={amountRowStyle}>
                        <span>Night Halt</span>
                        <span>₹{nightHaltTotal.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div style={{ ...amountRowStyle, borderTop: '2px solid #000000', fontWeight: 'bold', background: '#f8fafc' }}>
                        <span>Gross Total</span>
                        <span>₹{grossTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={amountRowStyle}>
                        <span>Advance</span>
                        <span>- ₹{parseFloat(advance || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={amountRowStyle}>
                        <span>Parking / Toll</span>
                        <span>+ ₹{parseFloat(parkingCharges || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ ...amountRowStyle, borderTop: '2px solid #000000', fontWeight: '900', fontSize: '14px', background: '#e2e8f0' }}>
                        <span>Net Total</span>
                        <span>₹{netTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                  </div>

                  {/* ── GARAGE TO GARAGE DISCLAIMER BANNER ── */}
                  <div style={{
                    border: '2px solid #000000', borderTop: 'none', padding: '6px 12px',
                    textAlign: 'center', fontWeight: '900', fontSize: '11px', letterSpacing: '0.5px'
                  }}>
                    TIMING & DISTANCE WILL BE CALCULATED FROM GARAGE TO GARAGE
                  </div>

                  {/* ── FOOTER: NEXT DAY INSTRUCTION & CUSTOMER USE CONFIRMATION ── */}
                  <div style={{ border: '2px solid #000000', borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    
                    {/* Next Day Instruction Sub-table */}
                    <div style={{ borderRight: '2px solid #000000', padding: '8px 12px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>Next Day Instruction</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #000000' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #000000' }}>
                            <th style={{ borderRight: '1px solid #000000', padding: '4px' }}>Date</th>
                            <th style={{ borderRight: '1px solid #000000', padding: '4px' }}>Time</th>
                            <th style={{ padding: '4px' }}>Place</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ borderRight: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{nextDayDate || '—'}</td>
                            <td style={{ borderRight: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{nextDayTime || '—'}</td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>{nextDayPlace || '—'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Customer Use Sign Section */}
                    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Customer Use:</div>
                        <div style={{ fontStyle: 'italic', fontSize: '11px', margin: '4px 0 12px 0' }}>"I Confirm Having Used The Car"</div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', width: '110px', paddingBottom: '3px' }}>Customer Name:</span>
                          <span style={underlineTextStyle}>{customerName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <span style={{ fontWeight: 'bold', width: '110px', paddingBottom: '3px' }}>Signature:</span>
                          <span style={{ ...underlineTextStyle, borderBottomStyle: 'dotted' }}></span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer Copyright */}
                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                  Thank you for choosing Rider Tours & Travels! For any support call +91 9841580722
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Sub-styles for preview document elements
const underlineTextStyle = {
  borderBottom: '1.5px solid #000000',
  flex: 1,
  paddingLeft: '6px',
  paddingRight: '6px',
  paddingBottom: '4px',
  lineHeight: '1.3',
  minHeight: '20px',
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#000000',
  boxSizing: 'border-box'
};

const boxedTextStyle = {
  border: '1px solid #000000',
  padding: '4px 8px',
  flex: 1,
  fontSize: '11px',
  fontWeight: '600',
  textAlign: 'center',
  lineHeight: '1.3',
  minHeight: '22px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box'
};

const amountRowStyle = {
  display: 'flex',
  justify: 'space-between',
  padding: '5px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '11px',
  lineHeight: '1.3'
};

// Form styles
const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#475569',
  marginBottom: '3px'
};

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '12px',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit'
};

const sectionHeaderStyle = {
  margin: '16px 0 10px 0',
  fontSize: '13px',
  fontWeight: 800,
  color: '#0f172a',
  background: '#f1f5f9',
  padding: '6px 10px',
  borderRadius: '6px'
};
