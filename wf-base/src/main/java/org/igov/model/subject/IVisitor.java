package org.igov.model.subject;
public interface IVisitor {
	 public void deepLevel(VSubjectGroupParentNode vSubjectGroupResult);
	 public void deepLevel(VSubjectGroupChildrenNode vSubjectGroupNode);
	 public void deepLevel(SubjectGroup subjectGroup);
	
}