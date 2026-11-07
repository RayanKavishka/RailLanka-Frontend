import { PencilIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner";
import { getAllUsersByRole, getUserById, saveUser, updateUser, updateUserStatus } from "../../services/userService";
import axios from "axios";

const UserRoles = {
    ADMIN: "ADMIN",
    PASSENGER: "PASSENGER",
    TICKET_INSPECTOR: "TICKET_INSPECTOR"

} as const;

type UserRoles = typeof UserRoles[keyof typeof UserRoles];

interface IUser {
    _id?: string;
    fullName: string;
    email: string;
    password: string;
    phone: string;
    roles: UserRoles[];
    isActive?: boolean;
}

const inputClass =
  "h-[52px] w-full rounded-2xl border border-[#E2E7EF] bg-white px-4 text-[15px] text-[#0D1B2A] " +
  "placeholder:text-[#5B6B7E]/55 transition " +
  "hover:border-[#CBD3DF] " +
  "focus:border-[#006D77] focus:outline-none focus:ring-4 focus:ring-[#006D77]/15";

const labelClass = "mb-2 block text-[14px] font-semibold leading-snug text-[#0D1B2A]";

const primaryBtnClass =
  "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#006D77] px-8 text-[15px] font-semibold text-white " +
  "shadow-[0_8px_20px_rgba(0,109,119,0.25)] transition hover:bg-[#005861] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/25 active:scale-[0.98] sm:w-auto";

const cardClass =
  "overflow-hidden rounded-3xl border border-[#E2E7EF]/70 bg-white shadow-[0_8px_24px_rgba(13,27,42,0.06)]";

const sectionTitleClass = "text-[20px] font-bold leading-tight tracking-tight text-[#0D1B2A]";
const sectionHintClass = "mt-1.5 text-[14px] leading-relaxed text-[#5B6B7E]";

const thClass =
  "px-6 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wide text-[#5B6B7E]";

const tdClass =
  "flex items-center justify-between gap-4 px-5 py-2.5 text-right text-[14px] text-[#0D1B2A] break-words " +
  "before:shrink-0 before:text-left before:text-[12px] before:font-semibold before:uppercase before:tracking-wide before:text-[#5B6B7E] " +
  "before:content-[attr(data-label)] " +
  "md:table-cell md:px-6 md:py-4 md:text-left md:before:content-none";

const iconBtnClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E7EF] bg-white text-[#0D1B2A] transition " +
  "hover:border-[#006D77]/40 hover:bg-[#E6F2F3] hover:text-[#006D77] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/20 active:scale-[0.96]";

const iconBtnDangerClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E7EF] bg-white text-[#B42318] transition " +
  "hover:border-[#F4C7C3] hover:bg-[#FEF3F2] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B42318]/15 active:scale-[0.96]";

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
};

const inputErrorClass =
  " !border-[#B42318] focus:!border-[#B42318] focus:!ring-[#B42318]/15";
const errorTextClass = "mt-1.5 text-[13px] font-medium text-[#B42318]";

const validateFullName = (value: string): string => {
  const v = value.trim();
  if (!v) return "Full name is required.";
  if (v.length < 3) return "Full name must be at least 3 characters.";
  if (v.length > 50) return "Full name must be 50 characters or less.";
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return "Full name can only contain letters, spaces, . ' and -";
  return "";
};

const validateEmail = (value: string): string => {
  const v = value.trim();
  if (!v) return "Email is required.";
  if (v.length > 100) return "Email must be 100 characters or less.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address.";
  return "";
};

const validatePassword = (value: string, skip: boolean): string => {
  if (skip) return "";
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > 64) return "Password must be 64 characters or less.";
  if (!/[a-z]/.test(value)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
  if (!/\d/.test(value)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a special character.";
  return "";
};

const validatePhone = (value: string): string => {
  const v = value.trim();
  if (!v) return "Phone number is required.";
  const cleaned = v.replace(/[\s-]/g, "");
  if (!/^(?:\+94|0)[1-9]\d{8}$/.test(cleaned)) {
    return "Enter a valid Sri Lankan phone number (e.g. +94 77 456 7893).";
  }
  return "";
};

const InspectorsPage = () => {

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [inspectors, setInspectors] = useState<IUser[]>([]);

  const [selectedInspectorId, setSelectedInspectorId] = useState<string | null>(null);

  const isEditMode = selectedInspectorId !== null;  

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password, isEditMode),
      phone: validatePhone(phone),
    };

    setErrors(newErrors);

    const firstError = Object.values(newErrors).find((msg) => msg);
    if (firstError) {
      toast.error(firstError);
      return false;
    }
    return true;
  };

  const handleAddOrUpdateBtn = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        const user: IUser = {
          _id: selectedInspectorId,
          fullName,
          email,
          password,
          phone,
          roles: [UserRoles.TICKET_INSPECTOR]
        } ;

        const res = await updateUser(user);

        if (res.status === 201 || res.status === 200) {
          toast.success("Inspector is updated successfully!");
          loadInspectors();
          setSelectedInspectorId(null);

          setFullName("");
          setEmail("");
          setPhone("");
          setPassword("");
          setErrors({});

        } else {
          toast.error(res.data.message);
          throw Error;
        }

      } else {

        const user: IUser = {
          fullName,
          email,
          password,
          phone,
          roles: [UserRoles.TICKET_INSPECTOR]
        } ;

        const res = await saveUser(user);

        if (res.status === 201 || res.status === 200) {
          toast.success("Inspector is saved successfully!");
          loadInspectors();

        } else {
          toast.error(res.data.message);
          throw Error;
        }

      } 

    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        toast.error(message);

      } else {
        toast.error("Something went wrong");
      }
    }
  }

  const handleLoadInspectorToUpdate = async (inspectorId: string) => {
    try {

      const userById = await getUserById(inspectorId);
      const inspector: IUser = userById.data.body;

      setSelectedInspectorId(inspectorId);

      setFullName(inspector.fullName);
      setEmail(inspector.email);
      setPhone(inspector.phone);
      setPassword("");
      setErrors({});

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  }

  const handleRemoveInspector = async (inspectorId: string) => {
    try {
        const res = await updateUserStatus(inspectorId);

        if (res.status === 201 || res.status === 200) {
          toast.success("Inspector is removed successfully!");
          loadInspectors();

        } else {
          toast.error(res.data.message);
          throw Error;
        }

    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        toast.error(message);

      } else {
        toast.error("Something went wrong");
      }
    }
  }

  const loadInspectors = useCallback(async () => {
      try {
        const res = await getAllUsersByRole(UserRoles.TICKET_INSPECTOR);

        if (res.status === 201 || res.status === 200) {
          setInspectors(res.data.body);

        } else {
          toast.error(res.data.message);
          throw Error;
        }

      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;

          toast.error(message);

        } else {
          toast.error("Something went wrong");
        }
      }

  }, []);

  useEffect(() => {
    loadInspectors();

  }, [loadInspectors]);

  return (
    <>
      <section className="w-full flex-1 bg-[#F4F6FA] px-4 pb-6 pt-0 text-[#0D1B2A] sm:px-6 sm:pb-8 lg:pb-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-5 sm:space-y-6">

          <form className={cardClass} noValidate>
            <div className="p-5 sm:p-8">

              <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#0D1B2A] sm:text-[30px]">
                Inspectors
              </h1>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#5B6B7E]">
                Add new ticket inspectors and manage existing ones.
              </p>

              <div className="mt-5 flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-[#0B1020] via-[#16224D] to-[#243B8A] px-6 py-5 text-white sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                <div>
                  <p className="text-[28px] font-bold leading-none tracking-tight sm:text-[34px]">
                    {inspectors.length}
                  </p>
                  <p className="mt-2 text-[15px] text-white/80">
                    Inspectors
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[18px] font-bold tracking-tight">
                    INSPECTOR access
                  </p>
                  <p className="mt-1 text-[14px] text-white/70">
                    Verify and validate tickets
                  </p>
                </div>
              </div>

              <h2 className={`${sectionTitleClass} mt-8 sm:mt-10`}>
                Inspector details
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">

                <div>
                  <label htmlFor="fullName" className={labelClass}>Full Name</label>
                  <input 
                    id="fullName"
                    type="text"
                    value={fullName}
                    maxLength={50}
                    aria-invalid={!!errors.fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((p) => ({ ...p, fullName: validateFullName(e.target.value) }));
                    }}
                    onBlur={() => setErrors((p) => ({ ...p, fullName: validateFullName(fullName) }))}
                    placeholder="e.g. Adam Smith"
                    className={inputClass + (errors.fullName ? inputErrorClass : "")}
                  />
                  {errors.fullName && <p className={errorTextClass}>{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input 
                    id="email"
                    type="text"
                    value={email}
                    maxLength={100}
                    aria-invalid={!!errors.email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: validateEmail(e.target.value) }));
                    }}
                    onBlur={() => setErrors((p) => ({ ...p, email: validateEmail(email) }))}
                    placeholder="e.g. adam@gmail.com"
                    className={inputClass + (errors.email ? inputErrorClass : "")}
                  />
                  {errors.email && <p className={errorTextClass}>{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className={labelClass}>Password</label>
                  <input 
                    id="password"
                    type="password"
                    value={password}
                    disabled={isEditMode}
                    maxLength={64}
                    aria-invalid={!!errors.password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: validatePassword(e.target.value, isEditMode) }));
                    }}
                    onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password, isEditMode) }))}
                    placeholder=".................."
                    className={inputClass + (errors.password ? inputErrorClass : "")}
                  />
                  {errors.password && <p className={errorTextClass}>{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>Phone Number</label>
                  <input 
                    id="phone"
                    type="text"
                    value={phone}
                    maxLength={16}
                    aria-invalid={!!errors.phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: validatePhone(e.target.value) }));
                    }}
                    onBlur={() => setErrors((p) => ({ ...p, phone: validatePhone(phone) }))}
                    placeholder="e.g. +94 77 456 7893"
                    className={inputClass + (errors.phone ? inputErrorClass : "")}
                  />
                  {errors.phone && <p className={errorTextClass}>{errors.phone}</p>}
                </div>

              </div>
            </div>

            <div className="flex border-t border-[#E2E7EF] bg-[#F8FAFC] px-5 py-4 sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={handleAddOrUpdateBtn}
                className={primaryBtnClass}
              >
                {isEditMode ? "Update Inspector" : "Add Inspector"}
              </button>
            </div>
          </form>  

          <div className={cardClass}>
            <div className="p-5 pb-4 sm:p-8 sm:pb-5">
              <h2 className={sectionTitleClass}>All inspectors</h2>
              <p className={sectionHintClass}>
                Use the actions to edit or remove a inspector.
              </p>
            </div>

            <div className="border-t border-[#E2E7EF]">
              <table className="block w-full md:table">
                <thead className="hidden bg-[#F8FAFC] md:table-header-group">
                  <tr className="border-b border-[#E2E7EF]">
                    <th className={thClass}>Full Name</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Phone No</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} md:text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody className="block space-y-3 p-4 sm:p-5 md:table-row-group md:space-y-0 md:p-0">
                  {inspectors.map((inspector) => {
                    return (
                      <tr
                        key={inspector._id}
                        className="block rounded-2xl border border-[#E2E7EF] bg-white py-2 md:table-row md:rounded-none md:border-0 md:border-b md:py-0 md:hover:bg-[#F8FAFC]"
                      >
                        <td data-label="Full Name" className={`${tdClass} font-semibold`}>{inspector.fullName}</td>
                        <td data-label="Email" className={tdClass}>{inspector.email}</td>
                        <td data-label="Phone No" className={tdClass}>{inspector.phone}</td>
                        <td data-label="Status" className={tdClass}>
                          <span
                            className={
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold " +
                              (inspector.isActive ? "bg-[#E6F2F3] text-[#006D77]" : "bg-[#FEF3F2] text-[#B42318]")
                            }
                          >
                            <span
                              className={
                                "h-1.5 w-1.5 rounded-full " +
                                (inspector.isActive ? "bg-[#006D77]" : "bg-[#B42318]")
                              }
                            />
                            {inspector.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td data-label="Action" className={tdClass}>
                          <div className="flex items-center gap-2 md:justify-end">
                            <button 
                              type="button"
                              aria-label="Update inspector"
                              title="Update inspector"
                              onClick={() => handleLoadInspectorToUpdate(inspector._id as string)}
                              className={iconBtnClass}
                            >
                              <PencilIcon className="h-[18px] w-[18px]" />
                            </button>
                            <button 
                              type="button"
                              aria-label="Remove inspector"
                              title="Remove inspector"
                              onClick={() => handleRemoveInspector(inspector._id as string)}
                              className={iconBtnDangerClass}
                            >
                              <Trash2 className="text-red-500 w-6 h-6" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

export default InspectorsPage;