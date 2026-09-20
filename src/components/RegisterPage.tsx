import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Briefcase,
  User,
  Stethoscope,
  Cpu,
  Building2,
  TreePine,
  RotateCcw,
} from 'lucide-react';
import { AppPage, UserRegistrationData, Gender } from '../types';
import { SearchableSelect } from './SearchableSelect';
import {
  getGovernorates,
  getCitiesForGovernorate,
  getNeighborhoodsForCity,
  getDistrictsForGovernorate,
  getSubdistrictsForDistrict,
  getVillagesForSubdistrict,
  arabicSort,
} from '../data/syriaData';
import { PROFESSIONS_CATALOG } from '../data/professionsCatalog';

interface RegisterPageProps {
  onNavigate: (page: AppPage) => void;
  onRegistrationSuccess?: (data: UserRegistrationData) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  onRegistrationSuccess,
}) => {
  // Wizard step: 1 (Personal Info) or 2 (Location & Profession)
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [formData, setFormData] = useState<UserRegistrationData>({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '+963 ', // default starts with Syria code and can be edited freely
    email: '',
    pageTitle: '',
    authMethod: 'direct',

    governorate: '',
    locationType: 'urban',
    city: '',
    neighborhood: '',
    district: '',
    subdistrict: '',
    village: '',
    addressDescription: '',

    professionCategory: '',
    specialty: '',
  });

  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [providerNotification, setProviderNotification] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Governorates list from JSON
  const governorates = useMemo(() => getGovernorates(), []);
  const governorateNames = useMemo(
    () => governorates.map((g) => g.governorate),
    [governorates]
  );

  // Selected governorate object
  const selectedGovObj = useMemo(() => {
    return governorates.find((g) => g.governorate === formData.governorate);
  }, [governorates, formData.governorate]);

  // Is selected governorate mixed type? (shows city vs rural toggle)
  const isMixedGov = selectedGovObj?.type === 'mixed';

  // Cities list
  const cities = useMemo(() => {
    if (!formData.governorate) return [];
    return getCitiesForGovernorate(formData.governorate).map((c) => c.city);
  }, [formData.governorate]);

  // Neighborhoods list
  const neighborhoods = useMemo(() => {
    if (!formData.governorate || !formData.city) return [];
    return getNeighborhoodsForCity(formData.governorate, formData.city);
  }, [formData.governorate, formData.city]);

  // Districts list for rural mode
  const districts = useMemo(() => {
    if (!formData.governorate) return [];
    return getDistrictsForGovernorate(formData.governorate).map((d) => d.district);
  }, [formData.governorate]);

  // Subdistricts list
  const subdistricts = useMemo(() => {
    if (!formData.governorate || !formData.district) return [];
    return getSubdistrictsForDistrict(formData.governorate, formData.district).map(
      (s) => s.subdistrict
    );
  }, [formData.governorate, formData.district]);

  // Villages list
  const villages = useMemo(() => {
    if (!formData.governorate || !formData.district || !formData.subdistrict) return [];
    return getVillagesForSubdistrict(
      formData.governorate,
      formData.district,
      formData.subdistrict
    );
  }, [formData.governorate, formData.district, formData.subdistrict]);

  // Profession categories & specialties
  const professionCategories = useMemo(() => {
    return PROFESSIONS_CATALOG.map((p) => p.name).sort(arabicSort);
  }, []);

  const selectedCategoryObj = useMemo(() => {
    return PROFESSIONS_CATALOG.find((p) => p.name === formData.professionCategory);
  }, [formData.professionCategory]);

  const specialtiesList = useMemo(() => {
    if (!selectedCategoryObj) return [];
    return [...selectedCategoryObj.specialties].sort(arabicSort);
  }, [selectedCategoryObj]);

  // Social accounts autofill
  const handleSocialRegister = (provider: 'google' | 'facebook' | 'apple') => {
    let importedName = '';
    let importedLastName = '';
    let importedEmail = '';
    let providerLabel = '';

    if (provider === 'google') {
      providerLabel = 'Google';
      importedName = 'محمد';
      importedLastName = 'السوري';
      importedEmail = 'mouhamad.sy@gmail.com';
    } else if (provider === 'facebook') {
      providerLabel = 'Facebook';
      importedName = 'محمد';
      importedLastName = 'الدمشقي';
      importedEmail = 'mouhamad.fb@weelink.app';
    } else if (provider === 'apple') {
      providerLabel = 'Apple';
      importedName = 'محمد';
      importedLastName = 'الحلبي';
      importedEmail = 'mouhamad@icloud.com';
    }

    setFormData((prev) => ({
      ...prev,
      firstName: importedName,
      lastName: importedLastName,
      email: importedEmail,
      authMethod: provider,
      // phone starts with Syria code, left for user to complete
      phone: prev.phone || '+963 ',
    }));

    setStep1Errors({});
    setProviderNotification(
      `تم استيراد بيانات حساب ${providerLabel} (الاسم والبريد). يرجى تحديد الجنس وإكمال رقم الهاتف للمتابعة.`
    );

    setTimeout(() => {
      setProviderNotification(null);
    }, 6000);
  };

  // Demo Autofill for Testing (Doctor or Engineer)
  const handleDemoFill = (role: 'doctor' | 'engineer') => {
    if (role === 'doctor') {
      setFormData({
        firstName: 'أحمد',
        lastName: 'الخطيب',
        gender: 'male',
        phone: '+963 944 123456',
        email: 'dr.ahmad.khatib@gmail.com',
        pageTitle: 'عيادة الدكتور أحمد الخطيب التخصصية',
        authMethod: 'direct',

        governorate: 'دمشق',
        locationType: 'urban',
        city: 'دمشق',
        neighborhood: 'أبو رمانة',
        district: '',
        subdistrict: '',
        village: '',
        addressDescription: 'شارع الجلاء، مقابل حديقة المدفع، بناء الشام الطابق الثاني',

        professionCategory: 'طبيب ورعاية صحية',
        specialty: 'طبيب عظمية وجراحة مفاصل',
      });
    } else {
      setFormData({
        firstName: 'سارة',
        lastName: 'النجار',
        gender: 'female',
        phone: '+963 988 654321',
        email: 'eng.sara.najjar@outlook.com',
        pageTitle: 'استوديو المهندسة سارة للحلول البرمجية',
        authMethod: 'google',

        governorate: 'حلب',
        locationType: 'urban',
        city: 'حلب',
        neighborhood: 'الشهباء',
        district: '',
        subdistrict: '',
        village: '',
        addressDescription: 'شارع المحطة، قرب ساحة سعد الله الجابري، برج النور',

        professionCategory: 'مهندس واستشارات هندسية',
        specialty: 'مهندس معلوماتية وبرمجيات',
      });
    }

    setStep1Errors({});
    setStep2Errors({});
    setProviderNotification(
      `تم ملء نموذج تجريبي كامل (${role === 'doctor' ? 'طبيب عظمية - دمشق' : 'مهندسة برمجيات - حلب'}). يمكنك التنقل بين الصفحات واختبار كل الحقول.`
    );
    setTimeout(() => {
      setProviderNotification(null);
    }, 7000);
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errs.firstName = 'الاسم مطلوب وإجباري';
    }

    if (!formData.lastName.trim()) {
      errs.lastName = 'الكنية مطلوبة وإجبارية';
    }

    if (!formData.gender) {
      errs.gender = 'يرجى تحديد الجنس';
    }

    if (!formData.phone.trim() || formData.phone.trim() === '+963') {
      errs.phone = 'رقم الهاتف مطلوب وإجباري';
    } else if (formData.phone.trim().length < 8) {
      errs.phone = 'يرجى إدخال رقم هاتف سوري صالح (مثال: +963 9...)';
    }

    if (!formData.email.trim()) {
      errs.email = 'البريد الإلكتروني مطلوب وإجباري';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.governorate) {
      errs.governorate = 'اختيار المحافظة إجباري';
    }

    if (formData.locationType === 'urban') {
      if (!formData.city) {
        errs.city = 'اختيار المدينة إجباري';
      }
      if (!formData.neighborhood.trim()) {
        errs.neighborhood = 'اختيار أو كتابة الحي إجباري';
      }
    } else {
      if (!formData.district) {
        errs.district = 'اختيار المنطقة إجباري';
      }
      if (!formData.subdistrict) {
        errs.subdistrict = 'اختيار الناحية إجباري';
      }
      if (!formData.village.trim()) {
        errs.village = 'اختيار أو كتابة القرية إجباري';
      }
    }

    if (!formData.professionCategory) {
      errs.professionCategory = 'يرجى اختيار تصنيف المهنة من الكتالوج';
    }

    if (!formData.specialty) {
      errs.specialty = 'يرجى اختيار الاختصاص أو المهنة التابعة';
    }

    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  // Transition from Step 1 to Step 2
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit final registration
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setIsSubmitted(true);
      if (onRegistrationSuccess) {
        onRegistrationSuccess(formData);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: '',
      phone: '+963 ',
      email: '',
      pageTitle: '',
      authMethod: 'direct',

      governorate: '',
      locationType: 'urban',
      city: '',
      neighborhood: '',
      district: '',
      subdistrict: '',
      village: '',
      addressDescription: '',

      professionCategory: '',
      specialty: '',
    });
    setStep(1);
    setStep1Errors({});
    setStep2Errors({});
    setIsSubmitted(false);
  };

  return (
    <motion.div
      id="register-wizard-view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10 w-full"
    >
      {/* Top Header & Breadcrumb */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <button
          id="register-back-to-home-btn"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        {/* Step Indicator Badges */}
        {!isSubmitted && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                step === 1
                  ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              1. البيانات الشخصية
            </span>
            <span className="text-gray-600 font-bold">›</span>
            <span
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                step === 2
                  ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              2. الموقع والمهنة
            </span>
          </div>
        )}
      </div>

      {/* Demo Autofill Shortcut Toolbar for Testing */}
      {!isSubmitted && (
        <div className="w-full max-w-2xl mb-5 p-3 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-blue-950/40 border border-orange-500/25 flex flex-wrap items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2 text-xs text-orange-200">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-semibold">تجربة سريعة لنقل الصفحات:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="demo-fill-doctor-btn"
              onClick={() => handleDemoFill('doctor')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 hover:text-white border border-orange-500/40 text-xs font-semibold transition-all cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-orange-400" />
              <span>ملء تجريبي: طبيب (دمشق)</span>
            </button>
            <button
              type="button"
              id="demo-fill-engineer-btn"
              onClick={() => handleDemoFill('engineer')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-semibold transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>ملء تجريبي: مهندسة (حلب)</span>
            </button>
          </div>
        </div>
      )}

      {/* Notification banner */}
      <AnimatePresence>
        {providerNotification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-2xl mb-5 p-3.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-start gap-3 text-xs sm:text-sm text-orange-200 overflow-hidden"
          >
            <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <div className="flex-1 text-right leading-relaxed">{providerNotification}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSubmitted ? (
        /* ================= SUCCESS REVIEW CARD ================= */
        <motion.div
          id="register-success-card"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl p-6 sm:p-10 rounded-3xl bg-[#081125] border border-orange-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-52 h-52 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-['Tajawal',sans-serif]">
            تم التسجيل وبناء الصفحة بنجاح!
          </h2>
          <p className="text-gray-300 text-sm mb-6">
            أهلاً بك في منصة <span className="text-orange-400 font-bold">weelink</span>. تم حفظ كامل بياناتك بنجاح.
          </p>

          {/* Full Details Summary Card */}
          <div className="bg-white/[0.03] rounded-2xl p-5 mb-6 text-right border border-white/10 space-y-4 text-sm">
            {/* Personal Section */}
            <div className="border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2">
                البيانات الشخصية:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400">الاسم الكامل: </span>
                  <span className="text-white font-semibold">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">الجنس: </span>
                  <span className="text-white font-semibold">
                    {formData.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">رقم الهاتف: </span>
                  <span className="text-white font-semibold" dir="ltr">
                    {formData.phone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">البريد الإلكتروني: </span>
                  <span className="text-white font-semibold" dir="ltr">
                    {formData.email}
                  </span>
                </div>
                {formData.pageTitle && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-400">عنوان الصفحة: </span>
                    <span className="text-orange-300 font-semibold">{formData.pageTitle}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2">
                الموقع والعنوان (الجمهورية العربية السورية):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400">المحافظة: </span>
                  <span className="text-white font-semibold">{formData.governorate}</span>
                </div>
                <div>
                  <span className="text-gray-400">نوع المنطقة: </span>
                  <span className="text-white font-semibold">
                    {formData.locationType === 'urban' ? 'مدينة ومحيطها' : 'ريف وبلدات'}
                  </span>
                </div>
                {formData.locationType === 'urban' ? (
                  <>
                    <div>
                      <span className="text-gray-400">المدينة: </span>
                      <span className="text-white font-semibold">{formData.city}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">الحي: </span>
                      <span className="text-orange-200 font-semibold">{formData.neighborhood}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-400">المنطقة: </span>
                      <span className="text-white font-semibold">{formData.district}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">الناحية: </span>
                      <span className="text-white font-semibold">{formData.subdistrict}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-400">القرية / البلدة: </span>
                      <span className="text-orange-200 font-semibold">{formData.village}</span>
                    </div>
                  </>
                )}
                {formData.addressDescription && (
                  <div className="sm:col-span-2 pt-1">
                    <span className="text-gray-400 block text-xs mb-1">وصف العنوان التفصيلي:</span>
                    <p className="bg-black/30 p-2.5 rounded-lg text-gray-200 text-xs leading-relaxed">
                      {formData.addressDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Profession Section */}
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2">
                المهنة والخدمات المسجلة:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400">الكتالوج الرئيسي: </span>
                  <span className="text-white font-semibold">{formData.professionCategory}</span>
                </div>
                <div>
                  <span className="text-gray-400">الاختصاص: </span>
                  <span className="text-orange-300 font-bold">{formData.specialty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="success-go-workshop-btn"
              onClick={() => onNavigate('workshop')}
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-[0_4px_20px_rgba(234,88,12,0.4)] cursor-pointer"
            >
              الانتقال إلى ورشة العمل
            </button>
            <button
              id="success-reset-form-btn"
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 font-semibold transition-all border border-white/10 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تسجيل حساب جديد</span>
            </button>
          </div>
        </motion.div>
      ) : step === 1 ? (
        /* ================= STEP 1: PERSONAL INFO ================= */
        <div
          id="registration-step1-card"
          className="w-full max-w-2xl p-6 sm:p-8 md:p-10 rounded-3xl bg-[#081125]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden"
        >
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-orange-500/10 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-['Tajawal',sans-serif]">
              إنشاء حساب جديد في Weelink
            </h1>
            <p className="text-sm text-gray-300">
              الخطوة الأولى: البيانات الشخصية وطرق التسجيل
            </p>
          </div>

          {/* Social Sign-In Providers Section */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3 text-right">
              التسجيل السريع عبر الحسابات:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Google */}
              <button
                type="button"
                id="social-btn-google"
                onClick={() => handleSocialRegister('google')}
                className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  formData.authMethod === 'google'
                    ? 'bg-orange-500/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                id="social-btn-facebook"
                onClick={() => handleSocialRegister('facebook')}
                className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  formData.authMethod === 'facebook'
                    ? 'bg-orange-500/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                id="social-btn-apple"
                onClick={() => handleSocialRegister('apple')}
                className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  formData.authMethod === 'apple'
                    ? 'bg-orange-500/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.8 1.1-1.91.98-3.03-1 .04-2.14.67-2.82 1.46-.58.68-1.1 1.78-.96 2.87 1.11.08 2.19-.57 2.8-1.3" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#081125] px-4 text-xs text-gray-400 font-medium whitespace-nowrap">
              أو إدخال البيانات مباشرة
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Form Step 1 */}
          <form onSubmit={handleNextStep} noValidate className="space-y-4 text-right">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-200 mb-1.5"
                >
                  الاسم <span className="text-orange-400 font-bold">* (إجباري)</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, firstName: e.target.value }));
                    if (step1Errors.firstName) {
                      setStep1Errors((p) => ({ ...p, firstName: '' }));
                    }
                  }}
                  placeholder=""
                  className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
                    step1Errors.firstName
                      ? 'border-red-500/80 bg-red-500/5'
                      : 'border-white/15 focus:border-orange-500/80'
                  }`}
                />
                {step1Errors.firstName && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{step1Errors.firstName}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-200 mb-1.5"
                >
                  الكنية <span className="text-orange-400 font-bold">* (إجباري)</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, lastName: e.target.value }));
                    if (step1Errors.lastName) {
                      setStep1Errors((p) => ({ ...p, lastName: '' }));
                    }
                  }}
                  placeholder=""
                  className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
                    step1Errors.lastName
                      ? 'border-red-500/80 bg-red-500/5'
                      : 'border-white/15 focus:border-orange-500/80'
                  }`}
                />
                {step1Errors.lastName && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{step1Errors.lastName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1.5">
                الجنس <span className="text-orange-400 font-bold">* (إجباري)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="gender-male-btn"
                  onClick={() => {
                    setFormData((p) => ({ ...p, gender: 'male' }));
                    if (step1Errors.gender) setStep1Errors((p) => ({ ...p, gender: '' }));
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formData.gender === 'male'
                      ? 'bg-orange-600/30 border-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                      : 'bg-white/[0.03] border-white/15 text-gray-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <User className="w-4 h-4 text-orange-400" />
                  <span>ذكر</span>
                </button>

                <button
                  type="button"
                  id="gender-female-btn"
                  onClick={() => {
                    setFormData((p) => ({ ...p, gender: 'female' }));
                    if (step1Errors.gender) setStep1Errors((p) => ({ ...p, gender: '' }));
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formData.gender === 'female'
                      ? 'bg-orange-600/30 border-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                      : 'bg-white/[0.03] border-white/15 text-gray-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <User className="w-4 h-4 text-pink-400" />
                  <span>أنثى</span>
                </button>
              </div>
              {step1Errors.gender && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{step1Errors.gender}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-200 mb-1.5"
              >
                البريد الإلكتروني <span className="text-orange-400 font-bold">* (إجباري)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, email: e.target.value }));
                  if (step1Errors.email) setStep1Errors((p) => ({ ...p, email: '' }));
                }}
                dir="ltr"
                placeholder=""
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
                  step1Errors.email
                    ? 'border-red-500/80 bg-red-500/5'
                    : 'border-white/15 focus:border-orange-500/80'
                }`}
              />
              {step1Errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{step1Errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone Number with Syrian country code prefix editable */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-200 mb-1.5"
              >
                رقم الهاتف (يبدأ افتراضياً بمفتاح سوريا +963 ويمكن تغييره){' '}
                <span className="text-orange-400 font-bold">* (إجباري)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, phone: e.target.value }));
                  if (step1Errors.phone) setStep1Errors((p) => ({ ...p, phone: '' }));
                }}
                dir="ltr"
                placeholder=""
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white text-left font-mono tracking-wider transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
                  step1Errors.phone
                    ? 'border-red-500/80 bg-red-500/5'
                    : 'border-white/15 focus:border-orange-500/80'
                }`}
              />
              {step1Errors.phone && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{step1Errors.phone}</span>
                </p>
              )}
            </div>

            {/* Page Title */}
            <div>
              <label
                htmlFor="pageTitle"
                className="block text-sm font-semibold text-gray-200 mb-1.5"
              >
                عنوان الصفحة (اختياري)
              </label>
              <input
                type="text"
                id="pageTitle"
                name="pageTitle"
                value={formData.pageTitle}
                onChange={(e) => setFormData((p) => ({ ...p, pageTitle: e.target.value }))}
                placeholder=""
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/80"
              />
            </div>

            {/* Next Button - Name changed to 'التالي' as explicitly requested */}
            <div className="pt-5">
              <button
                type="submit"
                id="registration-next-btn"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-base md:text-lg transition-all duration-200 shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:shadow-[0_10px_30px_rgba(234,88,12,0.6)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>التالي</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ================= STEP 2: LOCATION & PROFESSION ================= */
        <div
          id="registration-step2-card"
          className="w-full max-w-2xl p-6 sm:p-8 md:p-10 rounded-3xl bg-[#081125]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-orange-500/10 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-['Tajawal',sans-serif]">
              الموقع والمهنة في سوريا
            </h1>
            <p className="text-sm text-gray-300">
              الخطوة الثانية: حدد موقعك الجغرافي واختصاصك المهني
            </p>
          </div>

          <form onSubmit={handleFinalSubmit} noValidate className="space-y-6 text-right">
            {/* Location Section */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-orange-400 font-bold text-sm sm:text-base">
                <MapPin className="w-4 h-4" />
                <span>الموقع الجغرافي (الجمهورية العربية السورية)</span>
              </div>

              {/* Governorate Dropdown */}
              <SearchableSelect
                id="select-governorate"
                label="المحافظة"
                required
                options={governorateNames}
                value={formData.governorate}
                onChange={(gov) => {
                  const govObj = governorates.find((g) => g.governorate === gov);
                  setFormData((prev) => ({
                    ...prev,
                    governorate: gov,
                    locationType: govObj?.type === 'rural' ? 'rural' : 'urban',
                    city: '',
                    neighborhood: '',
                    district: '',
                    subdistrict: '',
                    village: '',
                  }));
                  if (step2Errors.governorate) {
                    setStep2Errors((prev) => ({ ...prev, governorate: '' }));
                  }
                }}
                error={step2Errors.governorate}
                hint="ابحث أو اختر المحافظة (الترتيب أبجدي مع تجاهل 'ال' التعريف)"
              />

              {/* If Governorate is mixed type, show Urban vs Rural selector */}
              {formData.governorate && isMixedGov && (
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-1.5">
                    نوع الموقع <span className="text-orange-400 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="location-type-urban-btn"
                      onClick={() => {
                        setFormData((p) => ({
                          ...p,
                          locationType: 'urban',
                          district: '',
                          subdistrict: '',
                          village: '',
                        }));
                      }}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        formData.locationType === 'urban'
                          ? 'bg-orange-600/30 border-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                          : 'bg-white/[0.03] border-white/15 text-gray-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-orange-400" />
                      <span>مدينة ومراكز حضرية</span>
                    </button>

                    <button
                      type="button"
                      id="location-type-rural-btn"
                      onClick={() => {
                        setFormData((p) => ({
                          ...p,
                          locationType: 'rural',
                          city: '',
                          neighborhood: '',
                        }));
                      }}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        formData.locationType === 'rural'
                          ? 'bg-orange-600/30 border-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                          : 'bg-white/[0.03] border-white/15 text-gray-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <TreePine className="w-4 h-4 text-emerald-400" />
                      <span>ريف وبلدات وقرى</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Urban Flow: City -> Neighborhood */}
              {formData.governorate && formData.locationType === 'urban' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <SearchableSelect
                    id="select-city"
                    label="المدينة"
                    required
                    options={cities}
                    value={formData.city}
                    onChange={(selectedCity) => {
                      setFormData((p) => ({ ...p, city: selectedCity, neighborhood: '' }));
                      if (step2Errors.city) {
                        setStep2Errors((p) => ({ ...p, city: '' }));
                      }
                    }}
                    error={step2Errors.city}
                    hint="ابحث بكتابة الحرف الأول لتختصر القائمة"
                  />

                  {/* Neighborhood with Manual Custom Entry allowed */}
                  <SearchableSelect
                    id="select-neighborhood"
                    label="الحي"
                    required
                    options={neighborhoods}
                    value={formData.neighborhood}
                    onChange={(selectedNeigh) => {
                      setFormData((p) => ({ ...p, neighborhood: selectedNeigh }));
                      if (step2Errors.neighborhood) {
                        setStep2Errors((p) => ({ ...p, neighborhood: '' }));
                      }
                    }}
                    disabled={!formData.city}
                    allowCustomEntry={true}
                    error={step2Errors.neighborhood}
                    hint="اختر من القائمة أو اكتب اسم الحي يدوياً إن لم تجده"
                  />
                </div>
              )}

              {/* Rural Flow: District -> Subdistrict -> Village */}
              {formData.governorate && formData.locationType === 'rural' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* District */}
                    <SearchableSelect
                      id="select-district"
                      label="المنطقة"
                      required
                      options={districts}
                      value={formData.district}
                      onChange={(selDistrict) => {
                        setFormData((p) => ({
                          ...p,
                          district: selDistrict,
                          subdistrict: '',
                          village: '',
                        }));
                        if (step2Errors.district) {
                          setStep2Errors((p) => ({ ...p, district: '' }));
                        }
                      }}
                      error={step2Errors.district}
                      hint="ابحث في مناطق الريف"
                    />

                    {/* Subdistrict */}
                    <SearchableSelect
                      id="select-subdistrict"
                      label="الناحية"
                      required
                      options={subdistricts}
                      value={formData.subdistrict}
                      onChange={(selSubdistrict) => {
                        setFormData((p) => ({
                          ...p,
                          subdistrict: selSubdistrict,
                          village: '',
                        }));
                        if (step2Errors.subdistrict) {
                          setStep2Errors((p) => ({ ...p, subdistrict: '' }));
                        }
                      }}
                      disabled={!formData.district}
                      error={step2Errors.subdistrict}
                      hint="اختر الناحية التابعة"
                    />
                  </div>

                  {/* Village with Manual Custom Entry allowed */}
                  <SearchableSelect
                    id="select-village"
                    label="القرية / المزرعة / البلدة"
                    required
                    options={villages}
                    value={formData.village}
                    onChange={(selVillage) => {
                      setFormData((p) => ({ ...p, village: selVillage }));
                      if (step2Errors.village) {
                        setStep2Errors((p) => ({ ...p, village: '' }));
                      }
                    }}
                    disabled={!formData.subdistrict}
                    allowCustomEntry={true}
                    error={step2Errors.village}
                    hint="اختر من القائمة أو اكتب اسم القرية يدوياً إن لم تجدها"
                  />
                </div>
              )}

              {/* Address Description Box */}
              <div>
                <label
                  htmlFor="addressDescription"
                  className="block text-sm font-semibold text-gray-200 mb-1.5"
                >
                  صندوق وصف للعنوان (تفاصيل إضافية)
                </label>
                <textarea
                  id="addressDescription"
                  name="addressDescription"
                  rows={2}
                  value={formData.addressDescription}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, addressDescription: e.target.value }))
                  }
                  placeholder=""
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/80 resize-none text-sm"
                />
              </div>
            </div>

            {/* Profession & Services Catalog Section */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-orange-400 font-bold text-sm sm:text-base">
                <Briefcase className="w-4 h-4" />
                <span>تشكيل المهنة والخدمات (كتالوج شامل)</span>
              </div>

              {/* Major Catalog Dropdown */}
              <SearchableSelect
                id="select-profession-category"
                label="الكتالوج الرئيسي للخدمات والمهن"
                required
                options={professionCategories}
                value={formData.professionCategory}
                onChange={(cat) => {
                  setFormData((p) => ({
                    ...p,
                    professionCategory: cat,
                    specialty: '',
                  }));
                  if (step2Errors.professionCategory) {
                    setStep2Errors((p) => ({ ...p, professionCategory: '' }));
                  }
                }}
                error={step2Errors.professionCategory}
                hint="مثال: طبيب، مهندس، مهني وحرفي، خدمات نقل، طبخ منزلي..."
              />

              {/* Sub-Catalog / Specialty Dropdown */}
              <SearchableSelect
                id="select-specialty"
                label="تحديد المهنة أو الاختصاص التابع"
                required
                options={specialtiesList}
                value={formData.specialty}
                onChange={(spec) => {
                  setFormData((p) => ({ ...p, specialty: spec }));
                  if (step2Errors.specialty) {
                    setStep2Errors((p) => ({ ...p, specialty: '' }));
                  }
                }}
                disabled={!formData.professionCategory}
                allowCustomEntry={true}
                error={step2Errors.specialty}
                hint="اختر الاختصاص أو اكتب اختصاصك يدوياً إن أردت تخصيصه"
              />
            </div>

            {/* Navigation Buttons: Previous & Submit */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="step2-prev-btn"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="order-2 sm:order-1 py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 font-semibold transition-all border border-white/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق (تعديل البيانات الشخصية)</span>
              </button>

              <button
                type="submit"
                id="submit-final-registration-btn"
                className="order-1 sm:order-2 flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-base md:text-lg transition-all duration-200 shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:shadow-[0_10px_30px_rgba(234,88,12,0.6)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>إتمام التسجيل وبناء الصفحة</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};
