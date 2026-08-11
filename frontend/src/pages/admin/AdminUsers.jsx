import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";
import { formatDateTime, getEntityId, normalizeText } from "./adminUtils.js";

const roleOptions = ["all", "admin", "doctor", "patient", "unknown"];

function buildDirectory({
  me,
  doctors,
  appointments,
  payments,
  prescriptions,
}) {
  const directory = new Map();
  const doctorIds = new Set(
    doctors.map((doctor) => getEntityId(doctor)).filter(Boolean),
  );

  const upsert = (user, fallbackRole, source) => {
    const userId = getEntityId(user);

    if (!userId) {
      return;
    }

    const existing = directory.get(userId);

    const role = user.role || fallbackRole || existing?.role || "unknown";
    const createdAt = user.createdAt || existing?.createdAt || null;
    const updatedAt = user.updatedAt || existing?.updatedAt || null;

    const nextValue = {
      id: userId,
      firstName: user.firstName || existing?.firstName || "",
      lastName: user.lastName || existing?.lastName || "",
      email: user.email || existing?.email || "",
      phone: user.phone || existing?.phone || "",
      role,
      createdAt,
      updatedAt,
      sources: new Set([...(existing?.sources || []), source]),
    };

    directory.set(userId, nextValue);
  };

  if (me) {
    upsert(me, "admin", "auth/me");
  }

  doctors.forEach((doctor) => {
    upsert(doctor, "doctor", "doctors");
  });

  appointments.forEach((appointment) => {
    const patient = appointment.patient || {};
    const doctor = appointment.doctor || {};

    upsert(patient, "patient", "appointments");
    upsert(doctor, "doctor", "appointments");
  });

  payments.forEach((payment) => {
    upsert(
      payment.patient || {},
      doctorIds.has(getEntityId(payment.patient)) ? "doctor" : "patient",
      "payments",
    );
    upsert(payment.doctor || {}, "doctor", "payments");
  });

  prescriptions.forEach((prescription) => {
    upsert(
      prescription.patient || {},
      doctorIds.has(getEntityId(prescription.patient)) ? "doctor" : "patient",
      "prescriptions",
    );
    upsert(prescription.doctor || {}, "doctor", "prescriptions");
  });

  return Array.from(directory.values())
    .map((entry) => ({
      ...entry,
      role:
        entry.role === "unknown" && doctorIds.has(entry.id)
          ? "doctor"
          : entry.role,
      sources: Array.from(entry.sources).sort(),
    }))
    .sort((a, b) => {
      const byRole = a.role.localeCompare(b.role);

      if (byRole !== 0) {
        return byRole;
      }

      return `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
      );
    });
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          meResponse,
          doctorsResponse,
          appointmentsResponse,
          paymentsResponse,
          prescriptionsResponse,
        ] = await Promise.all([
          api.get("/auth/me"),
          api.get("/doctors"),
          api.get("/appointments"),
          api.get("/payments"),
          api.get("/prescriptions"),
        ]);

        if (!active) {
          return;
        }

        const directory = buildDirectory({
          me: meResponse.data.user || null,
          doctors: doctorsResponse.data.doctors || [],
          appointments: appointmentsResponse.data.appointments || [],
          payments: paymentsResponse.data.payments || [],
          prescriptions: prescriptionsResponse.data.prescriptions || [],
        });

        setUsers(directory);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You do not have permission to access admin users data.");
        } else {
          setError(requestError.message || "Unable to load users data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = normalizeText(search);

    return users.filter((user) => {
      const fullName = normalizeText(`${user.firstName} ${user.lastName}`);
      const email = normalizeText(user.email);
      const phone = normalizeText(user.phone);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#0F766E]" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
          Users
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          User directory overview
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          This list is derived from existing read endpoints because no dedicated
          admin users listing endpoint exists.
        </p>
      </header>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <Input
              id="admin-user-search"
              name="admin-user-search"
              label="Search users"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or phone"
              inputClassName="pl-10"
            />
            <Search className="pointer-events-none -mt-[2.85rem] ml-3 h-4 w-4 text-[#94A3B8]" />
          </div>

          <div>
            <label
              htmlFor="admin-role-filter"
              className="mb-2 block text-sm font-semibold text-[#0F172A]"
            >
              Role
            </label>
            <select
              id="admin-role-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full min-h-11 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#0F766E] focus:ring-4 focus:ring-[#CCFBF1]"
            >
              {roleOptions.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption === "all"
                    ? "All roles"
                    : roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {users.length === 0 ? (
        <EmptyState
          title="No users discovered"
          description="No user records could be derived from current admin-accessible endpoints."
          Icon={Users}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No matching users"
          description="Try adjusting your search or role filter."
          Icon={Search}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => {
            const fullName =
              `${user.firstName || "Unknown"} ${user.lastName || ""}`.trim();

            return (
              <Card key={user.id} className="h-full" padding="compact">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-[#0F172A]">
                      {fullName}
                    </h2>
                    <p className="mt-1 break-all text-sm text-[#64748B]">
                      {user.email || "Email unavailable"}
                    </p>
                  </div>

                  <StatusBadge status={user.role} className="shrink-0" />
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-[#64748B]">
                  <p>Phone: {user.phone || "Not available"}</p>
                  <p>Created: {formatDateTime(user.createdAt)}</p>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                    Sources
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {user.sources.join(", ") || "Unknown"}
                  </p>
                </div>

                {user.role === "doctor" ? (
                  <div className="mt-4">
                    <Link
                      to={`/admin/doctors/${user.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:bg-[#F8FAFC] hover:text-[#0F766E]"
                    >
                      View doctor details
                    </Link>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </section>
      )}

      <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#92400E]">
        Full user administration is limited by backend contracts: there is no
        dedicated endpoint for listing all users or fetching arbitrary user
        details by ID.
      </div>

      <div>
        <Link
          to="/admin/doctors"
          className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:bg-[#F8FAFC] hover:text-[#0F766E]"
        >
          Open doctors directory
        </Link>
      </div>
    </div>
  );
}

export default AdminUsers;
