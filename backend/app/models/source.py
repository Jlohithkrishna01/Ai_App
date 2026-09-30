from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(1000), nullable=False)
    source_name = Column(String(255), nullable=False)
    snippet = Column(Text, nullable=True)

    message = relationship("Message", back_populates="sources")
