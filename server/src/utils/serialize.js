function idOf(value) {
  if (!value) {
    return null;
  }
  if (value._id) {
    return String(value._id);
  }
  return String(value);
}

export function serializeUser(user) {
  if (!user) {
    return null;
  }
  return {
    id: idOf(user),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function serializeUserRef(user) {
  if (!user) {
    return null;
  }
  if (typeof user !== 'object' || !user.name) {
    return { id: idOf(user) };
  }
  return {
    id: idOf(user),
    name: user.name,
    email: user.email,
    ...(user.role ? { role: user.role } : {}),
  };
}

export function serializeCompany(company) {
  if (!company) {
    return null;
  }
  return {
    id: idOf(company),
    name: company.name,
    industry: company.industry,
    location: company.location,
    website: company.website || '',
    phone: company.phone || '',
    description: company.description || '',
    createdBy: serializeUserRef(company.createdBy),
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

export function serializeCompanyRef(company) {
  if (!company) {
    return null;
  }
  if (typeof company !== 'object' || !company.name) {
    return { id: idOf(company) };
  }
  return {
    id: idOf(company),
    name: company.name,
    industry: company.industry,
    location: company.location,
  };
}

export function serializeLead(lead) {
  return {
    id: idOf(lead),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    notes: lead.notes || '',
    assignedTo: serializeUserRef(lead.assignedTo),
    company: serializeCompanyRef(lead.company),
    createdBy: serializeUserRef(lead.createdBy),
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export function serializeLeadRef(lead) {
  if (!lead) {
    return null;
  }
  if (typeof lead !== 'object' || !lead.name) {
    return { id: idOf(lead) };
  }
  return {
    id: idOf(lead),
    name: lead.name,
    email: lead.email,
    status: lead.status,
  };
}

export function serializeTask(task) {
  return {
    id: idOf(task),
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate,
    status: task.status,
    completedAt: task.completedAt || null,
    lead: serializeLeadRef(task.lead),
    assignedTo: serializeUserRef(task.assignedTo),
    createdBy: serializeUserRef(task.createdBy),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
