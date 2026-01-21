import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../../shared/utils/salary.utils.js';
import SalaryInput from '../components/SalaryInput.jsx';
import RadioGroup from '../components/RadioGroup.jsx';
import { salaryApi } from '../../../services/salaryApi.js';
import './SalaryCalculationPage.css';

const SalaryCalculationPage = () => {
  const [meta, setMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [regulation, setRegulation] = useState('');
  const [income, setIncome] = useState('');
  const [dependents, setDependents] = useState('');
  const [insuranceType, setInsuranceType] = useState('official');
  const [customInsuranceSalary, setCustomInsuranceSalary] = useState('');
  const [region, setRegion] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculationType, setCalculationType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setMetaLoading(true);
        const data = await salaryApi.getMeta();
        setMeta(data);
        const defaultReg = data?.regulations?.FROM_2026_01_01?.value
          ?? Object.values(data?.regulations || {})[0]?.value
          ?? '';
        const defaultRegion = data?.regions?.[0] ?? '';
        setRegulation(defaultReg);
        setRegion(defaultRegion);
      } catch (err) {
        setError(err?.message || 'Không tải được cấu hình lương');
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  const handleCalculateGrossToNet = async () => {
    const grossValue = parseFloat(income) || 0;
    const dependentsCount = parseInt(dependents) || 0;
    const insuranceSalaryValue = insuranceType === 'official' 
      ? grossValue 
      : parseFloat(customInsuranceSalary) || grossValue;

    if (grossValue <= 0) {
      alert('Vui lòng nhập thu nhập hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await salaryApi.calculateGrossToNet({
        grossSalary: grossValue,
        insuranceSalary: insuranceSalaryValue,
        dependents: dependentsCount,
        regulation,
        region,
      });
      setCalculationResult(result);
      setCalculationType('gross-to-net');
    } catch (err) {
      setError(err?.message || 'Không thể tính toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateNetToGross = async () => {
    const netValue = parseFloat(income) || 0;
    const dependentsCount = parseInt(dependents) || 0;
    const useGrossAsInsuranceBase = insuranceType === 'official';
    const insuranceSalaryValue = useGrossAsInsuranceBase
      ? 0
      : parseFloat(customInsuranceSalary) || 0;

    if (netValue <= 0) {
      alert('Vui lòng nhập thu nhập hợp lệ');
      return;
    }

    if (!useGrossAsInsuranceBase && insuranceSalaryValue <= 0) {
      alert('Vui lòng nhập mức lương đóng bảo hiểm hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await salaryApi.calculateNetToGross({
        netSalary: netValue,
        insuranceSalary: insuranceSalaryValue,
        dependents: dependentsCount,
        useGrossAsInsuranceBase,
        regulation,
        region,
      });
      setCalculationResult(result);
      setCalculationType('net-to-gross');
    } catch (err) {
      setError(err?.message || 'Không thể tính toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeChange = (e) => {
    setIncome(e.target.value);
  };

  const handleDependentsChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setDependents(value);
  };

  const handleCustomInsuranceChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    setCustomInsuranceSalary(rawValue);
  };

  return (
    <div className="salary-calculation-page">
      <div className="salary-calculation-container">
        <h1 className="page-title">
          Công cụ tính lương Gross sang Net và ngược lại [Chuẩn 2026]
        </h1>

        {metaLoading && <div className="regulation-warning">Đang tải cấu hình lương...</div>}
        {!metaLoading && !meta && (
          <div className="regulation-warning">Không tải được cấu hình lương. Vui lòng thử lại.</div>
        )}
        {error && <div className="regulation-warning">{error}</div>}

        {meta && (
          <div className="regulation-section">
            <RadioGroup
              label="Áp dụng quy định:"
              name="regulation"
              options={Object.values(meta.regulations || {}).map((r) => ({
                label: r.label,
                value: r.value,
              }))}
              value={regulation}
              onChange={(e) => setRegulation(e.target.value)}
            />
          </div>
        )}

        <div className="regulation-info">
          <p>
            Áp dụng mức lương cơ sở mới nhất có hiệu lực từ ngày 01/07/2024 (Theo Nghị định số 73/2024/NĐ-CP)
          </p>
          <p>
            Áp dụng mức lương tối thiểu vùng mới nhất có hiệu lực từ ngày 01/01/2026 (Theo Nghị định 293/2025/NĐ-CP)
          </p>
          <p>
            Áp dụng mức giảm trừ gia cảnh mới nhất 15,5 triệu đồng/tháng (186 triệu đồng/năm) với người nộp thuế và 6,2 triệu đồng/tháng với mỗi người phụ thuộc (Căn cứ vào Điều 1 Nghị quyết số 110/2025/UBTVQH15)
          </p>
          <p className="regulation-warning">
            Căn cứ Điều 30 Dự thảo Luật Thuế thu nhập cá nhân biểu thuế TNCN mới (giảm từ 7 xuống 5 bậc) có hiệu lực thi hành từ ngày 01 tháng 07 năm 2026. Tuy nhiên, luật chỉ rõ "Các quy định liên quan đến thu nhập từ kinh doanh, từ tiền lương, tiền công của cá nhân cư trú áp dụng từ kỳ tính thuế năm 2026." nghĩa là phương pháp tính 5 bậc thuế sẽ áp dụng với thu nhập từ kinh doanh, từ tiền lương, tiền công của cá nhân cư trú từ 1/1/2026.
          </p>
        </div>

        {meta && (
          <div className="fixed-info-section">
            <div className="fixed-info-item">
              <span className="fixed-info-label">Lương cơ sở:</span>
              <span className="fixed-info-value">{formatCurrency(meta.baseSalary)}₫</span>
            </div>
            <div className="fixed-info-item">
              <span className="fixed-info-label">Giảm trừ gia cảnh bản thân:</span>
              <span className="fixed-info-value">{formatCurrency(meta.personalDeduction)}₫</span>
            </div>
            <div className="fixed-info-item">
              <span className="fixed-info-label">Người phụ thuộc:</span>
              <span className="fixed-info-value">{formatCurrency(meta.dependentDeduction)}₫</span>
            </div>
          </div>
        )}

        <div className="input-section">
          <div className="input-row">
            <SalaryInput
              label="Thu Nhập:"
              icon="💰"
              placeholder="(VNĐ)"
              value={income}
              onChange={handleIncomeChange}
            />

            <SalaryInput
              label="Số người phụ thuộc:"
              icon="👤"
              placeholder="(Người)"
              value={dependents}
              onChange={handleDependentsChange}
              type="number"
            />
          </div>
        </div>

        <div className="insurance-section">
          <RadioGroup
            label="Mức lương đóng bảo hiểm:"
            name="insurance"
            horizontal={true}
            options={[
              { label: 'Trên lương chính thức', value: 'official' },
              {
                label: 'Khác:',
                value: 'custom',
                input: {
                  placeholder: '(VNĐ)',
                  value: customInsuranceSalary ? formatCurrency(customInsuranceSalary) : '',
                  onChange: handleCustomInsuranceChange,
                },
              },
            ]}
            value={insuranceType}
            onChange={(e) => setInsuranceType(e.target.value)}
          />
        </div>

        {meta && (
          <div className="region-section">
            <RadioGroup
              label="Vùng: (Giải thích)"
              name="region"
              horizontal={true}
              options={(meta.regions || []).map((r) => ({ label: r, value: r }))}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
        )}

        <div className="action-buttons">
          <button
            className="calculate-button gross-to-net"
            onClick={handleCalculateGrossToNet}
            disabled={loading || metaLoading || !meta}
          >
            GROSS → NET
          </button>
          <button
            className="calculate-button net-to-gross"
            onClick={handleCalculateNetToGross}
            disabled={loading || metaLoading || !meta}
          >
            NET → GROSS
          </button>
        </div>

        {calculationResult && (
          <div className="result-section">
            <div className="result-summary">
              <h3 className="result-section-title">Kết quả</h3>
              <div className="summary-table-horizontal">
                <div className="summary-cell">
                  <div className="summary-cell-label">Lương Gross</div>
                  <div className="summary-cell-value">{formatCurrency(calculationResult.grossSalary)}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-cell-label">Bảo hiểm</div>
                  <div className="summary-cell-value negative">-{formatCurrency(calculationResult.insurance.totalInsurance)}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-cell-label">Thuế TNCN</div>
                  <div className="summary-cell-value negative">-{formatCurrency(calculationResult.personalIncomeTax)}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-cell-label">Lương Net</div>
                  <div className="summary-cell-value">{formatCurrency(calculationResult.netSalary)}</div>
                </div>
              </div>
            </div>

            <div className="result-detailed">
              <h3 className="result-section-title">Diễn giải chi tiết (VNĐ)</h3>
              <div className="detailed-table">
                <div className="detailed-row">
                  <span className="detailed-label">Lương GROSS:</span>
                  <span className="detailed-value">{formatCurrency(calculationResult.grossSalary)}₫</span>
                </div>
                <div className="detailed-row">
                  <span className="detailed-label">Bảo hiểm xã hội (8%):</span>
                  <span className="detailed-value negative">-{formatCurrency(calculationResult.insurance.socialInsurance)}₫</span>
                </div>
                <div className="detailed-row">
                  <span className="detailed-label">Bảo hiểm y tế (1.5%):</span>
                  <span className="detailed-value negative">-{formatCurrency(calculationResult.insurance.healthInsurance)}₫</span>
                </div>
                <div className="detailed-row">
                  <span className="detailed-label">Bảo hiểm thất nghiệp (1%):</span>
                  <span className="detailed-value negative">-{formatCurrency(calculationResult.insurance.unemploymentInsurance)}₫</span>
                </div>
                <div className="detailed-row highlight">
                  <span className="detailed-label">Thu nhập trước thuế:</span>
                  <span className="detailed-value">{formatCurrency(calculationResult.incomeBeforeTax)}₫</span>
                </div>
                <div className="detailed-row">
                  <span className="detailed-label">Giảm trừ gia cảnh bản thân:</span>
                  <span className="detailed-value negative">-{formatCurrency(calculationResult.personalDeduction)}₫</span>
                </div>
                <div className="detailed-row">
                  <span className="detailed-label">Giảm trừ gia cảnh người phụ thuộc:</span>
                  <span className="detailed-value negative">-{formatCurrency(calculationResult.dependentDeduction)}₫</span>
                </div>
                <div className="detailed-row highlight">
                  <span className="detailed-label">Thu nhập chịu thuế:</span>
                  <span className="detailed-value">{formatCurrency(calculationResult.taxableIncome)}₫</span>
                </div>
                <div className="detailed-row">
                  <span className="detailed-label">Thuế thu nhập cá nhân(*):</span>
                  <span className="detailed-value negative">-{formatCurrency(calculationResult.personalIncomeTax)}₫</span>
                </div>
                <div className="detailed-row highlight net-salary">
                  <span className="detailed-label">Lương NET:</span>
                  <span className="detailed-value">{formatCurrency(calculationResult.netSalary)}₫</span>
                </div>
                <div className="detailed-note">
                  (Thu nhập trước thuế - Thuế thu nhập cá nhân.)
                </div>
              </div>
            </div>

            <div className="result-tax-details">
              <h3 className="result-section-title">(*) Chi tiết thuế thu nhập cá nhân (VNĐ)</h3>
              <div className="tax-table">
                <div className="tax-table-header">
                  <div className="tax-header-cell">Mức chịu thuế</div>
                  <div className="tax-header-cell">Thuế suất</div>
                  <div className="tax-header-cell">Lương chịu thuế</div>
                  <div className="tax-header-cell">Tiền nộp</div>
                </div>
                {calculationResult.taxBrackets && calculationResult.taxBrackets.length > 0 ? (
                  calculationResult.taxBrackets.map((bracket, index) => {
                    let bracketText = '';
                    if (bracket.max === 0) {
                      bracketText = `Trên ${bracket.min / 1000000} triệu VNĐ`;
                    } else if (bracket.min === 0) {
                      bracketText = `Đến ${bracket.max / 1000000} triệu VNĐ`;
                    } else {
                      bracketText = `Trên ${bracket.min / 1000000} triệu VNĐ đến ${bracket.max / 1000000} triệu VNĐ`;
                    }
                    return (
                      <div key={index} className="tax-table-row">
                        <div className="tax-cell">{bracketText}</div>
                        <div className="tax-cell">{(bracket.rate * 100).toFixed(0)}%</div>
                        <div className="tax-cell">{formatCurrency(bracket.taxableAmount)}</div>
                        <div className="tax-cell">{formatCurrency(bracket.taxAmount)}</div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="tax-table-row">
                      <div className="tax-cell">Đến 10 triệu VNĐ</div>
                      <div className="tax-cell">5%</div>
                      <div className="tax-cell">0</div>
                      <div className="tax-cell">0</div>
                    </div>
                    <div className="tax-table-row">
                      <div className="tax-cell">Trên 10 triệu VNĐ đến 30 triệu VNĐ</div>
                      <div className="tax-cell">10%</div>
                      <div className="tax-cell">0</div>
                      <div className="tax-cell">0</div>
                    </div>
                    <div className="tax-table-row">
                      <div className="tax-cell">Trên 30 triệu VNĐ đến 60 triệu VNĐ</div>
                      <div className="tax-cell">20%</div>
                      <div className="tax-cell">0</div>
                      <div className="tax-cell">0</div>
                    </div>
                    <div className="tax-table-row">
                      <div className="tax-cell">Trên 60 triệu VNĐ đến 100 triệu VNĐ</div>
                      <div className="tax-cell">30%</div>
                      <div className="tax-cell">0</div>
                      <div className="tax-cell">0</div>
                    </div>
                    <div className="tax-table-row">
                      <div className="tax-cell">Trên 100 triệu VNĐ</div>
                      <div className="tax-cell">35%</div>
                      <div className="tax-cell">0</div>
                      <div className="tax-cell">0</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {calculationResult.employerCosts && (
              <div className="result-employer">
                <h3 className="result-section-title">Người sử dụng lao động trả (VNĐ)</h3>
                <div className="employer-table">
                  <div className="employer-row">
                    <span className="employer-label">Lương GROSS:</span>
                    <span className="employer-value">{formatCurrency(calculationResult.employerCosts.grossSalary)}</span>
                  </div>
                  <div className="employer-row">
                    <span className="employer-label">Bảo hiểm xã hội (17%):</span>
                    <span className="employer-value">{formatCurrency(calculationResult.employerCosts.socialInsurance)}</span>
                  </div>
                  <div className="employer-row">
                    <span className="employer-label">Bảo hiểm Tai nạn lao động - Bệnh nghề nghiệp (0.5%):</span>
                    <span className="employer-value">{formatCurrency(calculationResult.employerCosts.occupationalAccident)}</span>
                  </div>
                  <div className="employer-row">
                    <span className="employer-label">Bảo hiểm y tế (3%):</span>
                    <span className="employer-value">{formatCurrency(calculationResult.employerCosts.healthInsurance)}</span>
                  </div>
                  <div className="employer-row">
                    <span className="employer-label">Bảo hiểm thất nghiệp (1%):</span>
                    <span className="employer-value">{formatCurrency(calculationResult.employerCosts.unemploymentInsurance)}</span>
                  </div>
                  <div className="employer-row total">
                    <span className="employer-label">Tổng cộng:</span>
                    <span className="employer-value">{formatCurrency(calculationResult.employerCosts.totalCost)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculationPage;
